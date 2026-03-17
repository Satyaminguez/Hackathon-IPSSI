FROM python:3.11-slim

# Répertoire de travail dans le container
WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Exposition du port Django
EXPOSE 8001

# Lancement du serveur de développement
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
