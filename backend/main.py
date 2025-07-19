from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv
from routes import router

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.environ.get('SESSION_SECRET', 'supersecret'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular API routes
app.include_router(router)

# /dashboard endpoint is handled in routes.py
# === DATABASE INTEGRATION (Supabase, Firebase) ===
# See db.py for actual integration code
# (No import needed)

@app.get("/health")
def health():
    return {"status": "ok"} 