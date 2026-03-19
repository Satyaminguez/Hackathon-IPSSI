import resend
from jinja2 import Environment, FileSystemLoader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration Resend
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Dossier des templates
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

async def send_reset_password_email(to_email: str, token: str):
    """
    Envoie un email de réinitialisation via l'API Resend.
    """
    if not RESEND_API_KEY:
        print("\n[ATTENTION] RESEND_API_KEY non configurée.")
        print(f"[TOKEN] {FRONTEND_URL}/reset-password?token={token}\n")
        return False

    try:
        # 1. Rendu du template HTML
        template = env.get_template("reset_password.html")
        html_content = template.render(
            email=to_email, 
            token=token, 
            frontend_url=FRONTEND_URL
        )

        # 2. Envoi via Resend SDK
        params = {
            "from": f"DocSafe AI <{EMAIL_SENDER}>",
            "to": [to_email],
            "subject": "Réinitialisez votre mot de passe - DocSafe AI",
            "html": html_content,
        }

        email = resend.Emails.send(params)
        
        print(f"[SUCCESS] Email envoyé via Resend (ID: {email['id']}) à {to_email}")
        return True

    except Exception as e:
        print(f"[ERROR] Échec de l'envoi via Resend : {e}")
        return False
