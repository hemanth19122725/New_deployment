from fastapi import FastAPI
from routes import destination_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Deployment Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destination_routes.api_router)