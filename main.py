import base64
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional

from login import get_current_user_identity, router as login_router

# Use Vertex AI chatbot when configured (via .env); otherwise fall back to echo
try:
    from services.vertex_ai import chatbot
    USE_VERTEX_AI = True
except Exception as e:
    chatbot = None
    USE_VERTEX_AI = False
    print(f"Vertex AI not loaded (missing .env?): {e}. Using echo for chat.")

try:
    from services.text_to_speech import tts_service
    USE_TTS = True
    TTS_LOAD_ERROR = None
except Exception as e:
    tts_service = None
    USE_TTS = False
    TTS_LOAD_ERROR = str(e)
    print(f"TTS service not loaded: {e}")

app = FastAPI(title="Elderly Healthcare Assistant")

# Allow frontend (Vite dev server) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)


class ChatRequest(BaseModel):
    prompt: str


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"


class TextToSpeechRequest(BaseModel):
    text: str
    language_code: Optional[str] = "en-US"
    voice_name: Optional[str] = None


def _get_tts_service():
    """
    Lazy-load TTS service so backend can recover after dependency/env fixes.
    """
    global tts_service, USE_TTS, TTS_LOAD_ERROR
    if USE_TTS and tts_service:
        return tts_service

    try:
        from services.text_to_speech import tts_service as loaded_tts_service
        tts_service = loaded_tts_service
        USE_TTS = True
        TTS_LOAD_ERROR = None
        return tts_service
    except Exception as error:
        USE_TTS = False
        TTS_LOAD_ERROR = str(error)
        return None


@app.get("/")
async def root():
    return {"message": "Elderly Healthcare Assistant Backend - Ready for chat!"}


@app.get("/api/chat/health")
async def chat_health():
    return {"status": "ok"}


@app.post("/api/chat/message")
async def chat_message(
    request: ChatMessageRequest,
    current_user: str = Depends(get_current_user_identity),
) -> Dict[str, str]:
    _ = current_user
    if USE_VERTEX_AI and chatbot:
        result = chatbot.chat(
            message=request.message,
            session_id=request.session_id or "default",
        )
        return {
            "response": result["response"],
            "model": result.get("model", "vertex_ai"),
        }
    # Fallback when Vertex AI is not configured
    return {
        "response": f"Echo: {request.message} (AI integration coming soon)",
        "model": "backend",
    }


@app.delete("/api/chat/session/{session_id}")
async def clear_session(
    session_id: str,
    current_user: str = Depends(get_current_user_identity),
):
    _ = current_user
    if USE_VERTEX_AI and chatbot:
        chatbot.clear_session(session_id)
    return {"status": "cleared"}


@app.post("/api/tts/speak")
async def text_to_speech(
    request: TextToSpeechRequest,
    current_user: str = Depends(get_current_user_identity),
) -> Dict[str, str]:
    _ = current_user
    service = _get_tts_service()
    if not service:
        raise HTTPException(
            status_code=503,
            detail=(
                "Text-to-speech service is not configured on the backend. "
                f"Reason: {TTS_LOAD_ERROR or 'Unknown error'}"
            ),
        )

    try:
        audio_content = service.synthesize_speech(
            text=request.text,
            language_code=request.language_code or "en-US",
            voice_name=request.voice_name,
        )
        audio_base64 = base64.b64encode(audio_content).decode("utf-8")
        return {
            "audio_base64": audio_base64,
            "mime_type": "audio/mpeg",
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to synthesize speech: {error}",
        ) from error


@app.post("/chat")
async def chat(request: ChatRequest) -> Dict[str, str]:
    return {"response": f"Echo: {request.prompt} (Gemini integration next)"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
