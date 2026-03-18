from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from bson import ObjectId
from security import get_current_admin, get_password_hash
from database import documents_collection, users_collection
from models import UserCreate

router = APIRouter(prefix="/admin", tags=["Espace Administrateur"])

def send_welcome_email(email: str, password: str, role: str):
    """
    Simule l'envoi d'un e-mail. À remplacer plus tard par un vrai service SMTP si besoin.
    """
    print(f"\n✉️ [EMAIL ENVOYÉ] À: {email} | Rôle: {role} | MDP provisoire: {password}\n")


@router.get("/documents")
async def get_all_documents(admin_user: dict = Depends(get_current_admin)):
    """Permet à l'admin de voir tous les documents uploadés et par qui"""
    # Remplacement de "timestamp" par "upload_date" pour correspondre à ton modèle Datalake
    cursor = documents_collection.find().sort("upload_date", -1)
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


@router.get("/dashboard")
async def get_dashboard_stats(admin_user: dict = Depends(get_current_admin)):
    """API Dashboard Admin : Statistiques globales de la plateforme"""
    total_users = await users_collection.count_documents({})
    total_fournisseurs = await users_collection.count_documents({"role": "user"})
    
    total_docs = await documents_collection.count_documents({})
    docs_valides = await documents_collection.count_documents({"curated_zone.status_final": "VALIDE"})
    docs_anomalies = await documents_collection.count_documents({"curated_zone.status_final": "A_VERIFIER"})
    
    return {
        "utilisateurs": {
            "total": total_users,
            "fournisseurs": total_fournisseurs,
            "admins": total_users - total_fournisseurs
        },
        "documents": {
            "total": total_docs,
            "valides": docs_valides,
            "en_anomalie": docs_anomalies
        }
    }