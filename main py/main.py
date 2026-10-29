from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    def generate():
        # stream=True hace que Ollama envíe el texto por partes en tiempo real
        stream = ollama.chat(
            model='gemma2:2b',  # O el modelo que estés usando
            messages=[
                {
                    'role': 'system', 
                    'content': 'Eres un asistente holográfico. Responde de forma muy breve y fluida.'
                },
                {'role': 'user', 'content': req.message}
            ],
            stream=True
        )
        for chunk in stream:
            # Va enviando cada pedazo de texto conforme se genera
            yield chunk['message']['content']

    return StreamingResponse(generate(), media_type="text/plain")