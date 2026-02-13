"""
Google Cloud Text-to-Speech service.
"""
import os
import json
import base64
from pathlib import Path
from typing import Optional

from google.auth import default
from google.auth.transport.requests import Request
import requests

from core.config import settings

TTS_SCOPE = "https://www.googleapis.com/auth/cloud-platform"


def _resolve_credentials_path(path: str) -> str:
    """Resolve relative paths from backend root."""
    clean_path = path.strip()
    if os.path.isabs(clean_path):
        return clean_path

    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.abspath(os.path.join(backend_root, clean_path))


def _ensure_credentials_env() -> None:
    """
    Reuse GOOGLE_APPLICATION_CREDENTIALS for both Vertex AI and TTS.
    """
    path = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", None)
    if path and path.strip():
        resolved = _resolve_credentials_path(path)
        if os.path.isfile(resolved):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = resolved
            return

    # Fallback: auto-pick a service account key from backend/services
    services_dir = Path(__file__).resolve().parent
    key_candidates = sorted(services_dir.glob("*.json"))
    if not key_candidates:
        return

    preferred_key = next(
        (candidate for candidate in key_candidates if candidate.name.endswith("4e7.json")),
        key_candidates[0],
    )
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(preferred_key)


class GoogleTextToSpeechService:
    def __init__(self) -> None:
        _ensure_credentials_env()
        # Validate ADC early so startup/first use errors are explicit.
        default(scopes=[TTS_SCOPE])
        self.translate_url = "https://translation.googleapis.com/language/translate/v2"
        self.tts_url = "https://texttospeech.googleapis.com/v1/text:synthesize"

    def _translate_text_with_vertex(self, text: str, language_code: str) -> str:
        target_language = (language_code or "en-US").split("-")[0].lower()
        if target_language == "en":
            return text

        token = self._get_access_token()
        project_id = settings.GOOGLE_CLOUD_PROJECT
        location = settings.VERTEX_AI_LOCATION
        model_name = settings.VERTEX_AI_MODEL
        endpoint = (
            f"https://{location}-aiplatform.googleapis.com/v1/"
            f"projects/{project_id}/locations/{location}/publishers/google/models/{model_name}:generateContent"
        )

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                f"Translate the following text to language code '{target_language}'. "
                                "Return only translated text without quotes or notes.\n\n"
                                f"Text: {text}"
                            )
                        }
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1024,
            },
        }

        response = requests.post(
            endpoint,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            data=json.dumps(payload),
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return text
        parts = (candidates[0].get("content") or {}).get("parts") or []
        translated = (parts[0].get("text", "") if parts else "").strip()
        return translated or text

    def _get_access_token(self) -> str:
        credentials, _ = default(scopes=[TTS_SCOPE])
        credentials.refresh(Request())
        return credentials.token

    def _translate_text(self, text: str, language_code: str) -> str:
        target_language = (language_code or "en-US").split("-")[0].lower()
        if target_language == "en":
            return text

        token = self._get_access_token()
        payload = {
            "q": text,
            "target": target_language,
            "format": "text",
        }
        if getattr(settings, "GOOGLE_CLOUD_PROJECT", None):
            payload["model"] = "nmt"

        try:
            response = requests.post(
                self.translate_url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()
            translated = (
                data.get("data", {})
                .get("translations", [{}])[0]
                .get("translatedText", "")
            )
            return translated or text
        except requests.exceptions.RequestException as error:
            print(f"⚠️ Cloud Translation API failed ({error}), trying Vertex fallback...")
            return self._translate_text_with_vertex(text, language_code)

    def synthesize_speech(
        self,
        text: str,
        language_code: str = "en-US",
        voice_name: Optional[str] = None,
    ) -> bytes:
        if not text or not text.strip():
            raise ValueError("Text must not be empty.")

        source_text = text.strip()
        try:
            # Translate to selected TTS language when needed (ex: de/es/fr).
            spoken_text = self._translate_text(source_text, language_code)
        except Exception as error:
            print(f"⚠️ Translation failed, using original text. Error: {error}")
            spoken_text = source_text

        token = self._get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        def _payload(name: Optional[str]) -> dict:
            voice = {
                "languageCode": language_code,
                "ssmlGender": "NEUTRAL",
            }
            if name:
                voice["name"] = name
            return {
                "input": {"text": spoken_text},
                "voice": voice,
                "audioConfig": {"audioEncoding": "MP3"},
            }

        response = requests.post(
            self.tts_url,
            headers=headers,
            data=json.dumps(_payload(voice_name)),
            timeout=30,
        )

        if response.status_code == 400 and voice_name:
            # Retry with provider default voice if selected voice is unsupported.
            response = requests.post(
                self.tts_url,
                headers=headers,
                data=json.dumps(_payload(None)),
                timeout=30,
            )

        response.raise_for_status()
        data = response.json()
        audio_base64 = data.get("audioContent")
        if not audio_base64:
            raise RuntimeError("No audioContent returned from TTS API.")
        return base64.b64decode(audio_base64)


tts_service = GoogleTextToSpeechService()
