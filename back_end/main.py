from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, fournisseur, admin
from routers import auth, admin

app = FastAPI(
    title="Plateforme IDP - Hackathon 2026",
    description="API Backend avec authentification JWT, Ingestion et Validation de documents.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(auth.router)
app.include_router(fournisseur.router)
app.include_router(admin.router)

@app.get("/", tags=["Système"])
async def root():
    return {
        "status": "online",
        "message": "Le Backend du Hackathon est parfaitement opérationnel !"
    }