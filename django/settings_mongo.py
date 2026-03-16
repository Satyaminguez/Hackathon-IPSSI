"""
Extrait de settings.py — Configuration MongoDB avec mongoengine
Remplace le contenu de ton fichier config/settings.py par ceci
"""
import os
from mongoengine import connect

# ── Sécurité ────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django_secret_key_hkt_2026")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = ["*"]

# ── Base de données ──────────────────────────────────────────────────────────
# mongoengine gère MongoDB directement — on garde une DB sqlite vide
# juste pour que Django ne se plaigne pas (sessions, admin auth, etc.)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "/app/db.sqlite3",
    }
}

# Connexion MongoDB via mongoengine
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://admin:admin@mongodb:27017/hkt_db?authSource=admin"
)
connect(host=MONGO_URI)

# ── Apps installées ──────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "crispy_forms",
    # "conformite",   # ton app métier ici
]

CRISPY_TEMPLATE_PACK = "bootstrap4"

# ── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ── Statiques ────────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"