from fastapi import (
    FastAPI,
    HTTPException,
    status,
    Request,
)

from starlette.middleware.cors import CORSMiddleware

from src.dependecies import authenticate_user
from src.routers import router

import base64
import binascii

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=["http://localhost:3000", "http://0.0.0.0:3000", "http://localhost:19006", "http://0.0.0.0:19006", "http://localhost:19002", "http://0.0.0.0:19002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def authenticate(request: Request, call_next):
    if "Authorization" in request.headers:
        auth = request.headers["Authorization"]
        try:
            scheme, credentials = auth.split()
            if scheme.lower() == 'basic':
                decoded = base64.b64decode(credentials).decode("ascii")
                username, _, password = decoded.partition(":")
                request.state.user = await authenticate_user(username, password)
        except (ValueError, UnicodeDecodeError, binascii.Error):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid basic auth credentials"
            )

    response = await call_next(request)
    return response

app.include_router(router)
