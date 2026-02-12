"""
Google Cloud Text-to-Speech service.
"""
import os
from pathlib import Path
from typing import Optional

from google.auth import default
from google.cloud import texttospeech

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
        self.client = texttospeech.TextToSpeechClient()

    def synthesize_speech(
        self,
        text: str,
        language_code: str = "en-US",
        voice_name: Optional[str] = None,
    ) -> bytes:
        if not text or not text.strip():
            raise ValueError("Text must not be empty.")

        synthesis_input = texttospeech.SynthesisInput(text=text.strip())
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )
        return response.audio_content


tts_service = GoogleTextToSpeechService()
