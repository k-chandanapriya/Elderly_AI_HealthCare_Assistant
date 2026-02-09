from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Elderly Healthcare Assistant")

class ChatRequest(BaseModel):
    prompt: str

@app.get("/")
async def root():
    return {"message": "Elderly Healthcare Assistant Backend - Ready for chat!"}

@app.post("/chat")
async def chat(request: ChatRequest) -> Dict[str, str]:
    # TODO: Integrate Gemini API here
    return {"response": f"Echo: {request.prompt} (Gemini integration next)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)