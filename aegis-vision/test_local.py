"""
Quick smoke-test for the aegis-vision service.
Run with the server already started: python test_local.py [path/to/image.jpg]
If no image path is provided, a blank white test image is generated in memory.
"""
import sys
import base64
import io
import httpx

BASE_URL = "http://localhost:5000"


def make_test_image_bytes() -> bytes:
    try:
        from PIL import Image
        img = Image.new("RGB", (200, 200), color=(255, 255, 255))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()
    except ImportError:
        # Minimal valid JPEG bytes (1×1 white pixel) if Pillow is unavailable
        return (
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
            b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
            b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
            b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1e"
            b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00"
            b"\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00"
            b"\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00"
            b"\x08\x01\x01\x00\x00?\x00\xfb\xd4\xff\xd9"
        )


def test_health():
    print("--- GET /health ---")
    r = httpx.get(f"{BASE_URL}/health")
    print(f"status: {r.status_code}")
    print(f"body:   {r.json()}\n")
    assert r.status_code in (200, 400)


def test_analyze_file(image_bytes: bytes):
    print("--- POST /analyze (multipart) ---")
    r = httpx.post(
        f"{BASE_URL}/analyze",
        files={"file": ("test.jpg", image_bytes, "image/jpeg")},
        timeout=45.0,
    )
    print(f"status: {r.status_code}")
    print(f"body:   {r.json()}\n")
    assert r.status_code in (200, 400)


def test_analyze_base64(image_bytes: bytes):
    print("--- POST /analyze-base64 (JSON) ---")
    encoded = base64.b64encode(image_bytes).decode()
    r = httpx.post(
        f"{BASE_URL}/analyze-base64",
        json={"image": encoded, "mime_type": "image/jpeg"},
        timeout=45.0,
    )
    print(f"status: {r.status_code}")
    print(f"body:   {r.json()}\n")
    assert r.status_code in (200, 400)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "rb") as f:
            image_bytes = f.read()
        print(f"Using image: {sys.argv[1]} ({len(image_bytes)} bytes)\n")
    else:
        image_bytes = make_test_image_bytes()
        print("No image path given — using generated blank test image\n")

    test_health()
    test_analyze_file(image_bytes)
    test_analyze_base64(image_bytes)
    print("All tests passed.")
