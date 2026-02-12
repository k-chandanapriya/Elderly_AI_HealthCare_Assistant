"""
Vertex AI Chatbot Service - Tuned model only (generateContent API).
Auth: service account JSON key path (GOOGLE_APPLICATION_CREDENTIALS in .env) or gcloud ADC.
"""
import os
import requests
import json
from typing import Dict, Any, List
from google.auth import default
from google.auth.transport.requests import Request
from google.auth.exceptions import DefaultCredentialsError

from core.config import settings


# Vertex AI generateContent scope
VERTEX_AI_SCOPE = "https://www.googleapis.com/auth/cloud-platform"

# User-facing message when ADC are not set up
ADC_HELP_MESSAGE = (
    "The backend is not authenticated with Google Cloud. "
    "Set GOOGLE_APPLICATION_CREDENTIALS in your .env to the full path of your service account JSON key file."
)


def _resolve_credentials_path(path: str) -> str:
    """Resolve relative path to absolute (relative to backend root)."""
    path = path.strip()
    if os.path.isabs(path):
        return path
    # Resolve relative to backend directory (parent of services/)
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.abspath(os.path.join(backend_root, path))


def _ensure_credentials_env() -> None:
    """If config has a JSON key path, set it so google.auth.default() uses it."""
    path = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", None)
    if path and path.strip():
        resolved = _resolve_credentials_path(path)
        if os.path.isfile(resolved):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = resolved
        else:
            print(f"⚠️ GOOGLE_APPLICATION_CREDENTIALS file not found: {resolved}")


def _get_access_token() -> str:
    """Get OAuth2 access token (service account key or ADC)."""
    _ensure_credentials_env()
    try:
        credentials, _ = default(scopes=[VERTEX_AI_SCOPE])
        credentials.refresh(Request())
        return credentials.token
    except DefaultCredentialsError as e:
        print(f"❌ {e}")
        print("   → Set GOOGLE_APPLICATION_CREDENTIALS in .env to your service account JSON key path")
        raise


class VertexAIChatbot:
    """Vertex AI tuned model via generateContent API only."""

    def __init__(self):
        try:
            _ensure_credentials_env()
            creds_path = getattr(settings, "GOOGLE_APPLICATION_CREDENTIALS", None)
            creds_resolved = _resolve_credentials_path(creds_path) if creds_path and creds_path.strip() else None
            if creds_resolved and os.path.isfile(creds_resolved):
                print("   Auth: Service account key from GOOGLE_APPLICATION_CREDENTIALS")

            project_id = settings.GOOGLE_CLOUD_PROJECT
            location = settings.VERTEX_AI_LOCATION
            endpoint_id = settings.VERTEX_AI_TUNED_ENDPOINT_ID
            model_id = settings.VERTEX_AI_TUNED_MODEL_ID

            # Tuned model: generateContent (not Predict)
            # Supports either deployed endpoint or tuned model resource.
            if endpoint_id:
                self.base_url = (
                    f"https://{location}-aiplatform.googleapis.com/v1"
                    f"/projects/{project_id}/locations/{location}/endpoints/{endpoint_id}"
                )
                self.resource_type = "endpoint"
                self.resource_id = endpoint_id
            elif model_id:
                self.base_url = (
                    f"https://{location}-aiplatform.googleapis.com/v1"
                    f"/projects/{project_id}/locations/{location}/models/{model_id}"
                )
                self.resource_type = "model"
                self.resource_id = model_id
            else:
                raise ValueError(
                    "Set either VERTEX_AI_TUNED_ENDPOINT_ID or VERTEX_AI_TUNED_MODEL_ID in .env"
                )

            self.generate_content_url = f"{self.base_url}:generateContent"

            self.system_instruction = {
                "role": "user",
                "parts": [{
                    "text": """You are a helpful healthcare assistant designed for elderly users.
Your role is to:
- Provide friendly, clear, and simple responses
- Help with medication reminders and health questions
- Offer appointment scheduling assistance
- Suggest gentle exercises and wellness tips
- Always be patient, kind, and respectful
- Use simple language and short sentences
- Never provide medical diagnoses or replace professional medical advice
- Always remind users to consult their doctor for serious concerns

Keep responses concise and easy to understand."""
                }]
            }

            self.conversations: Dict[str, List[Dict[str, Any]]] = {}

            print("✅ Vertex AI Tuned Model (generateContent) initialized")
            print(f"   Project: {project_id}, Location: {location}, {self.resource_type.title()}: {self.resource_id}")
            if not (creds_resolved and os.path.isfile(creds_resolved)):
                print("   Auth: Application Default Credentials (ADC)")

        except Exception as e:
            print(f"❌ Failed to initialize Vertex AI: {e}")
            raise

    def _get_or_create_conversation(self, session_id: str) -> List[Dict[str, Any]]:
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        return self.conversations[session_id]

    def _build_contents(self, conversation: List[Dict], new_message: str) -> List[Dict]:
        """Build contents for generateContent: conversation history + new user message."""
        contents = []
        for msg in conversation:
            role = "user" if msg["role"] == "user" else "model"
            text = msg["parts"][0]["text"]
            contents.append({"role": role, "parts": [{"text": text}]})
        contents.append({"role": "user", "parts": [{"text": new_message}]})
        return contents

    def chat(self, message: str, session_id: str = "default") -> Dict:
        try:
            conversation = self._get_or_create_conversation(session_id)
            contents = self._build_contents(conversation, message)

            payload = {
                "contents": contents,
                "systemInstruction": self.system_instruction,
                "generationConfig": {
                    "maxOutputTokens": settings.MAX_TOKENS,
                    "temperature": settings.TEMPERATURE,
                    "topP": 0.8,
                    "topK": 40,
                },
            }

            token = _get_access_token()
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            }

            print("📤 Sending request to Vertex AI tuned model (generateContent)...")

            response = requests.post(
                self.generate_content_url,
                headers=headers,
                data=json.dumps(payload),
                timeout=60,
            )

            if response.status_code != 200:
                err = response.json() if response.text else {}
                msg = err.get("error", {}).get("message", response.text or f"HTTP {response.status_code}")
                print(f"❌ API Error: {msg}")
                if "not found" in msg.lower() and self.resource_type == "endpoint":
                    print("   Tip: endpoint ID may be invalid or in a different region/project.")
                    print("   If you only have tuned model ID, set VERTEX_AI_TUNED_MODEL_ID instead.")
                raise Exception(f"API Error: {msg}")

            data = response.json()
            print("📥 Response received")

            # GenerateContentResponse: candidates[0].content.parts[0].text
            candidates = data.get("candidates") or []
            if not candidates:
                raise Exception("No candidates in response")
            content = candidates[0].get("content") or {}
            parts = content.get("parts") or []
            if not parts:
                raise Exception("No parts in candidate content")
            ai_response = parts[0].get("text", "").strip()
            if not ai_response:
                raise Exception("Empty model response")

            # Append to history
            conversation.append({"role": "user", "parts": [{"text": message}]})
            conversation.append({"role": "model", "parts": [{"text": ai_response}]})

            return {
                "response": ai_response,
                "session_id": session_id,
                "model": f"{settings.VERTEX_AI_MODEL} (Vertex AI tuned)",
            }

        except DefaultCredentialsError:
            return {
                "response": ADC_HELP_MESSAGE,
                "session_id": session_id,
                "error": "Default credentials not found",
            }
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            return {
                "response": "I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
                "session_id": session_id,
                "error": str(e),
            }
        except Exception as e:
            print(f"❌ Error in chat: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again.",
                "session_id": session_id,
                "error": str(e),
            }

    def clear_session(self, session_id: str) -> None:
        if session_id in self.conversations:
            del self.conversations[session_id]
            print(f"✅ Session {session_id} cleared")


chatbot = VertexAIChatbot()
