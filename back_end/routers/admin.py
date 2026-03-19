from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import FileResponse
import os
from bson import ObjectId
from security import get_current_admin, get_password_hash
from database import documents_collection, users_collection
from models import UserCreate, StatusUpdate
from typing import List

router = APIRouter(prefix="/admin", tags=["Espace Administrateur"])

def send_welcome_email(email: str, password: str, role: str):
    print(f"\n✉️ [EMAIL ENVOYÉ] À: {email} | Rôle: {role} | MDP provisoire: {password}\n")


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


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks, 
    admin_user: dict = Depends(get_current_admin)
):
    """API pour ajouter un utilisateur (fournisseur ou admin) depuis le panel admin"""
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_dict = user.dict()
    plain_password = user_dict.pop("password") 
    user_dict["hashed_password"] = get_password_hash(plain_password)
    
    await users_collection.insert_one(user_dict)

    background_tasks.add_task(send_welcome_email, user.email, plain_password, user.role)
    
    return {"message": f"Utilisateur {user.email} créé avec succès. Un email lui a été envoyé."}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_current_admin)):
    """API pour supprimer un utilisateur via son ID MongoDB"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Format d'ID invalide")
        
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": "Utilisateur supprimé avec succès"}

@router.get("/users/{email}/details")
async def get_user_details(email: str, admin_user: dict = Depends(get_current_admin)):
    """Récupère le profil détaillé d'un utilisateur et tous ses documents"""
    user = await users_collection.find_one({"email": email}, {"hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Client non trouvé")
        
    user["_id"] = str(user["_id"])
    
    # Documents rattachés à cet email
    cursor = documents_collection.find({"uploaded_by": email}).sort("upload_date", -1)
    docs = await cursor.to_list(length=200)
    
    # Formatage ObjectId pour JSON
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        
    return {
        "profile": user,
        "documents": docs
    }

from services.email_service import send_document_validated_email, send_document_rejected_email

@router.patch("/documents/{doc_id}/status")
async def update_doc_status(
    doc_id: str, 
    update: StatusUpdate, 
    background_tasks: BackgroundTasks,
    admin_user: dict = Depends(get_current_admin)
):
    """Changer le statut d'un document (Vérifié, En attente, Refusé) et notifier le client"""
    if not ObjectId.is_valid(doc_id):
        raise HTTPException(status_code=400, detail="ID invalide")
    
    # Récupérer le document avant mise à jour pour avoir l'email et le nom de fichier
    doc = await documents_collection.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")

    result = await documents_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"curated_zone.status_final": update.status}}
    )
    
    # Envoi d'email 
    actual_filename = doc.get("raw_zone", {}).get("filename", "Document")
    if update.status == "VERIFIE":
        background_tasks.add_task(send_document_validated_email, doc.get("uploaded_by"), actual_filename)
    elif update.status == "REFUSE":
        reason = update.reason or "Votre document présente une non-conformité majeure après analyse manuelle."
        background_tasks.add_task(send_document_rejected_email, doc.get("uploaded_by"), actual_filename, reason)
    
    # --- NOUVEAU : Déclenchement automatique du pipeline Airflow Validation ---
    from utils.airflow import trigger_dag
    background_tasks.add_task(trigger_dag, "2_document_validation_and_export", {
        "document_id": doc_id,
        "user_email": doc.get("uploaded_by"),
        "status": update.status
    })
        
    return {"message": f"Statut mis à jour : {update.status}"}

@router.delete("/documents/{doc_id}")
async def delete_document_admin(doc_id: str, admin_user: dict = Depends(get_current_admin)):
    """API pour supprimer définitivement un document de la plateforme"""
    if not ObjectId.is_valid(doc_id):
        raise HTTPException(status_code=400, detail="ID invalide")
    
    result = await documents_collection.delete_one({"_id": ObjectId(doc_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document introuvable")
        
    return {"message": "Document supprimé avec succès"}

@router.get("/documents/{doc_id}/view")
async def view_document_admin(doc_id: str, admin_user: dict = Depends(get_current_admin)):
    """Visualiser un document (Stream PDF/Image) côté admin"""
    if not ObjectId.is_valid(doc_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    doc = await documents_collection.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    file_path = doc.get("raw_zone", {}).get("physical_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le disque")
    
    return FileResponse(file_path)

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