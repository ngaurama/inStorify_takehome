# ./main.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import todos


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo List API",
    description="Todo list API with sqlite",
    version="0.0.1"
)

allowed_origins = [settings.frontend_url]
if hasattr(settings, "lan_url") and settings.lan_url:
    allowed_origins.append(settings.lan_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(todos.router, prefix="/api", tags=["todos"])


# @app.get("/")
# def root():
#     return {
#         "message": "Todo api is running",
#         "docs": "/docs",
#         "endpoints": {
#             "GET": [
#                 "/api/todos",
#                 "/api/todos/{id}",
#                 "/api/todos/stats"
#             ],
#             "POST": ["/api/todos"],
#             "PUT": ["/api/todos/{id}"],
#             "DELETE": ["/api/todos/{id}"]
#         }
#     }

FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # serves the static files
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets"
    )

    app.mount(
        "/favicon_io",
        StaticFiles(directory=FRONTEND_DIST / "favicon_io"),
        name="favicon"
    )

    # serves index.html for any non-API route like react routr
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(FRONTEND_DIST / "index.html")
