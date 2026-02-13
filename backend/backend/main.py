from fastapi import Depends, FastAPI
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


@app.post("/chat")
async def chat(request: ChatRequest) -> Dict[str, str]:
    return {"response": f"Echo: {request.prompt} (Gemini integration next)"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
