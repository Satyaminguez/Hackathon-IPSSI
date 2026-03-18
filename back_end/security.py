from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import users_collection

SECRET_KEY = "HACKATHON_IDP_2026_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    """Vérifie si le mot de passe fourni correspond au hash en base de données"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hache le mot de passe avant de le sauvegarder"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Génère le token JWT contenant l'email et le rôle"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dépendance : Vérifie le token et retourne l'utilisateur actuel"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
    
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
 
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Dépendance : Vérifie que l'utilisateur actuel a le rôle 'admin'"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilèges Administrateur requis pour cette action"
        )
    return current_user