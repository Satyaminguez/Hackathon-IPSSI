from fastapi import APIRouter, Depends
from security import get_current_admin
from database import documents_collection, users_collection

router = APIRouter(prefix="/admin", tags=["Espace Administrateur"])

@router.get("/documents")
async def get_all_documents(admin_user: dict = Depends(get_current_admin)):
    """Permet à l'admin de voir tous les documents uploadés et par qui"""
    cursor = documents_collection.find().sort("timestamp", -1)
    docs = await cursor.to_list(length=100)
    
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        
    return docs

@router.get("/users")
async def get_all_users(admin_user: dict = Depends(get_current_admin)):
    """Permet à l'admin de lister tous les utilisateurs inscrits sur la plateforme"""

    cursor = users_collection.find({}, {"hashed_password": 0}) 
    users = await cursor.to_list(length=100)
    
    for user in users:
        user["_id"] = str(user["_id"])
        
    return users