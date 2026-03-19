from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import UserCreate, Token, UserResponse, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest
from security import get_password_hash, verify_password, create_access_token, get_current_user
from database import users_collection
from bson import ObjectId
import uuid
from datetime import datetime, timedelta
from services.email_service import send_reset_password_email # Import du nouveau service

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Inscription d'un nouvel utilisateur avec rôle 'user' par défaut"""
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email est déjà utilisé.")

    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    await users_collection.insert_one(user_dict)
    
    return {"message": f"Utilisateur {user.email} créé avec succès en tant que {user.role}"}

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Le Frontend envoie email/mot de passe et récupère un Token JWT et les infos utilisateur"""
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    # Préparer les infos utilisateur pour la réponse
    user_info = UserResponse(**user)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user_info
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Récupère le profil de l'utilisateur connecté"""
    return current_user

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """API de déconnexion indicative pour JWT"""
    return {"message": "Déconnexion réussie"}

@router.post("/forget-password")
async def forget_password(request: ForgotPasswordRequest):
    """Génère un token de réinitialisation et envoie un véritable email (via SMTP)"""
    user = await users_collection.find_one({"email": request.email})
    if not user:
        # On renvoie un succès même si l'user n'existe pas (Sécurité pour éviter l'énumération d'email)
        return {"message": "Si l'email existe, un lien a été envoyé."}
    
    token = str(uuid.uuid4())
    expiration = datetime.now() + timedelta(hours=1)
    
    await users_collection.update_one(
        {"email": request.email},
        {"$set": {"reset_token": token, "reset_token_expires": expiration}}
    )
    
    # Envoi de l'email réel
    await send_reset_password_email(request.email, token)
    
    return {"message": "Lien de réinitialisation envoyé par email."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Réinitialise le mot de passe via un token valide"""
    user = await users_collection.find_one({
        "reset_token": request.token,
        "reset_token_expires": {"$gt": datetime.now()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré.")
    
    new_hashed_password = get_password_hash(request.new_password)
    
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"hashed_password": new_hashed_password},
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )
    
    return {"message": "Mot de passe mis à jour avec succès."}
