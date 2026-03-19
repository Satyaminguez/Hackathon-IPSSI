from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from bson import ObjectId
from security import get_current_admin, get_password_hash
from database import documents_collection, users_collection
from models import UserCreate, StatusUpdate
from typing import List

router = APIRouter(prefix="/admin", tags=["Espace Administrateur"])

# --- FONCTION SIMULATION EMAIL ---
def send_welcome_email(email: str, password: str, role: str):
    print(f"\n✉️ [EMAIL ENVOYÉ] À: {email} | Rôle: {role} | MDP provisoire: {password}\n")

# --- ROUTES ADMINISTRATION ---

@router.get("/documents")
async def get_all_documents(admin_user: dict = Depends(get_current_admin)):
    """Lister tous les documents de la plateforme"""
    cursor = documents_collection.find().sort("upload_date", -1)
    docs = await cursor.to_list(length=200)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs

@router.get("/users")
async def get_all_users(admin_user: dict = Depends(get_current_admin)):
    """Lister uniquement les clients (rôle 'user')"""
    # On filtre pour ne pas lister les administrateurs
    cursor = users_collection.find({"role": "user"}, {"hashed_password": 0}).sort("_id", -1)
    users = await cursor.to_list(length=100)
    for user in users:
        user["_id"] = str(user["_id"])
        # Compter ses documents
        doc_count = await documents_collection.count_documents({"uploaded_by": user["email"]})
        user["document_count"] = doc_count
    return users

@router.get("/users/{email}/details")
async def get_user_details(email: str, admin_user: dict = Depends(get_current_admin)):
    """Voir le détail d'un client (infos + ses documents)"""
    user = await users_collection.find_one({"email": email}, {"hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user["_id"] = str(user["_id"])
    
    # Documents de cet utilisateur
    cursor = documents_collection.find({"uploaded_by": email}).sort("upload_date", -1)
    docs = await cursor.to_list(length=100)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    
    return {
        "profile": user,
        "documents": docs
    }

@router.patch("/documents/{doc_id}/status")
async def update_doc_status(doc_id: str, update: StatusUpdate, admin_user: dict = Depends(get_current_admin)):
    """Changer le statut d'un document (Vérifié, En attente, Refusé)"""
    if not ObjectId.is_valid(doc_id):
        raise HTTPException(status_code=400, detail="ID invalide")
    
    result = await documents_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"curated_zone.status_final": update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Document non trouvé ou aucun changement")
        
    return {"message": f"Statut mis à jour : {update.status}"}

@router.get("/dashboard")
async def get_dashboard_stats(admin_user: dict = Depends(get_current_admin)):
    """Statistiques globales"""
    total_users = await users_collection.count_documents({})
    total_docs = await documents_collection.count_documents({})
    docs_verifies = await documents_collection.count_documents({"curated_zone.status_final": "VERIFIE"})
    docs_attente = await documents_collection.count_documents({"curated_zone.status_final": "EN_ATTENTE"})
    
    return {
        "utilisateurs": {"total": total_users},
        "documents": {
            "total": total_docs,
            "verifies": docs_verifies,
            "en_attente": docs_attente
        }
    }