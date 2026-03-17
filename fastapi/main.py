from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import os

app = FastAPI(title="HKT - API Documents", version="1.0.0")

# ── Connexion MongoDB ────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin@localhost:27017/hkt_db?authSource=admin")

@app.on_event("startup")
async def startup_db():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
    app.db = app.mongodb_client["hkt_db"]
    print("Connecté à MongoDB")

@app.on_event("shutdown")
async def shutdown_db():
    app.mongodb_client.close()

# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "HKT FastAPI opérationnel"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Importe tes routers ici, ex :
# from routers import documents, ocr
# app.include_router(documents.router, prefix="/documents")
# app.include_router(ocr.router, prefix="/ocr")
