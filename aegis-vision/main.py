import base64
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from gemini_client import analyze_image_bytes

load_dotenv()

VISION_PORT = int(os.getenv("VISION_PORT", "5001"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[aegis-vision] starting up on port {VISION_PORT}")
    yield
    print("[aegis-vision] shutting down")


app = FastAPI(title="Aegis Vision API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    image: str
    mime_type: str = "image/jpeg"


@app.get("/health")
async def health():
    return {"status": "ok", "service": "aegis-vision"}


@app.post("/analyze")
async def analyze(body: AnalyzeRequest):
    print(f"[/analyze] received base64 image, declared mime={body.mime_type}")

    try:
        image_bytes = base64.b64decode(body.image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 string")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Decoded image is empty")

    result = analyze_image_bytes(image_bytes, mime_type=body.mime_type)
    print(f"[/analyze] result: {result}")
    return result


@app.post("/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    print(f"[/analyze] received file: name={file.filename}, content_type={file.content_type}")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    mime_type = file.content_type or "image/jpeg"
    result = analyze_image_bytes(image_bytes, mime_type=mime_type)

    print(f"[/analyze] result: {result}")
    return result


@app.post("/analyze-base64")
async def analyze_base64(body: AnalyzeRequest):
    return await analyze(body)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=VISION_PORT, reload=False)
