import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.complaint import router as complaint_router
from routers.chat import router as chat_router

load_dotenv()

app = FastAPI(
    title="AIVOA Complaint Management System",
    version="1.0.0",
    description="AI-powered Customer Complaint Management for Pharma QMS",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaint_router)
app.include_router(chat_router)

@app.get("/health")
def health():
    return {"status": "ok"}