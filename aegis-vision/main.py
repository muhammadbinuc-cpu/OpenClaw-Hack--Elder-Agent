import os
import base64
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from gemini_client import analyze_image_bytes

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[aegis-vision] starting up on port 5000")
    if BACKEND_URL:
        print(f"[aegis-vision] will forward results to backend: {BACKEND_URL}")
    else:
        print("[aegis-vision] BACKEND_URL not set — results will not be forwarded")
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


class Base64ImageRequest(BaseModel):
    image: str
    mime_type: str = "image/jpeg"


async def _forward_to_backend(result: dict) -> None:
    if not BACKEND_URL or "error" in result:
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(BACKEND_URL, json=result)
            print(f"[backend] forwarded result — status {resp.status_code}")
    except Exception as e:
        print(f"[backend] forward failed (non-fatal): {e}")


def _make_response(result: dict):
    if "error" in result:
        return JSONResponse(status_code=400, content=result)
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "service": "aegis-vision"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    print(f"[/analyze] received file: name={file.filename}, content_type={file.content_type}")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    mime_type = file.content_type or "image/jpeg"
    result = analyze_image_bytes(image_bytes, mime_type=mime_type)

    print(f"[/analyze] result: {result}")
    await _forward_to_backend(result)
    return _make_response(result)


@app.post("/analyze-base64")
async def analyze_base64(body: Base64ImageRequest):
    print(f"[/analyze-base64] received base64 image, declared mime={body.mime_type}")

    try:
        image_bytes = base64.b64decode(body.image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 string")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Decoded image is empty")

    result = analyze_image_bytes(image_bytes, mime_type=body.mime_type)

    print(f"[/analyze-base64] result: {result}")
    await _forward_to_backend(result)
    return _make_response(result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
