"""
DAG principal — Pipeline complet de traitement des documents administratifs
===========================================================================
Ordre des tâches :
  1. ingestion       → lance main.py du dataset_generator, génère les PDFs
  2. classification  → détecte le type de chaque document (facture/devis/attestation)
  3. ocr             → extraction du texte brut (MOCKÉ — à remplacer quand l'OCR est prêt)
  4. validation      → détection d'incohérences (SIRET, TVA, TTC, dates)
  5. stockage        → sauvegarde des résultats dans MongoDB Atlas (collection documents)
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from airflow import DAG
from airflow.operators.python import PythonOperator

# =============================================================================
# Configuration
# =============================================================================
default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=2),
}

DATASET_GENERATOR_PATH = "/opt/airflow/dataset_generator/src"
METADATA_PATH = "/opt/airflow/dataset_generator/data/metadata/metadata.json"

# =============================================================================
# Définition du DAG
# =============================================================================
with DAG(
    dag_id="pipeline_documents",
    description="Pipeline complet : génération → classification → OCR → validation → stockage",
    default_args=default_args,
    start_date=datetime(2026, 1, 1),
    schedule_interval=None,   # Déclenché manuellement
    catchup=False,
    tags=["hackathon", "documents", "ocr", "pipeline"],
) as dag:

    # -------------------------------------------------------------------------
    # TASK 1 — INGESTION
    # Lance le main.py du dataset_generator et récupère la liste des documents
    # -------------------------------------------------------------------------
    def task_ingestion(**context):
        """
        Lance la génération des documents via le dataset_generator.
        Récupère ensuite le metadata.json pour passer la liste des docs
        aux tâches suivantes via XCom.
        """
        import subprocess
        import json
        from dotenv import load_dotenv

        # Charge la clé INSEE depuis le .env du dataset_generator
        env_path = Path("/opt/airflow/dataset_generator/.env")
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
            print(f"[INGESTION] .env chargé depuis {env_path}")
        else:
            print(f"[INGESTION] ⚠️  Pas de .env trouvé dans {env_path}")

        # Vérifie que la clé INSEE est présente
        api_key = os.getenv("INSEE_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "[INGESTION] ❌ INSEE_API_KEY manquante.\n"
                "Ajoutez-la dans dataset_generator/.env"
            )
        print(f"[INGESTION] ✅ Clé INSEE trouvée ({api_key[:6]}...)")

        # Lance le main.py
        print("[INGESTION] 🚀 Lancement de la génération des documents...")
        result = subprocess.run(
            [sys.executable, "main.py"],
            cwd=DATASET_GENERATOR_PATH,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minutes max
        )

        for line in result.stdout.splitlines():
            print(f"[INGESTION] {line}")

        if result.returncode != 0:
            for line in result.stderr.splitlines():
                print(f"[INGESTION][ERR] {line}")
            raise RuntimeError(
                f"[INGESTION] ❌ main.py a échoué (code {result.returncode})"
            )

        print("[INGESTION] ✅ Génération terminée")

        # Lit le metadata.json pour récupérer la liste des documents générés
        metadata_file = Path(METADATA_PATH)
        if not metadata_file.exists():
            raise FileNotFoundError(
                f"[INGESTION] ❌ metadata.json introuvable : {METADATA_PATH}"
            )

        documents = json.loads(metadata_file.read_text(encoding="utf-8"))
        print(f"[INGESTION] 📄 {len(documents)} documents trouvés dans metadata.json")

        # Pousse la liste complète vers les tâches suivantes
        context["ti"].xcom_push(key="documents", value=documents)

    # -------------------------------------------------------------------------
    # TASK 2 — CLASSIFICATION
    # Détecte le type de chaque document à partir de son nom de fichier
    # -------------------------------------------------------------------------
    def task_classification(**context):
        """
        Classe chaque document en facture / devis / attestation
        à partir du nom du fichier ou du champ 'type' dans les métadonnées.
        Ta camarade peut remplacer cette logique par son modèle IA.
        """
        ti        = context["ti"]
        documents = ti.xcom_pull(task_ids="ingestion", key="documents")

        documents_classifies = []

        for doc in documents:
            # Utilise le champ 'type' du metadata s'il existe déjà
            if doc.get("type") and doc["type"] != "inconnu":
                doc_type = doc["type"]
            else:
                # Sinon classification par mot-clé dans le nom du fichier
                doc_name = doc.get("doc_id", "").lower()
                if "fac" in doc_name:
                    doc_type = "facture"
                elif "dev" in doc_name:
                    doc_type = "devis"
                elif "att" in doc_name:
                    doc_type = "attestation"
                else:
                    doc_type = "inconnu"

            doc["doc_type"] = doc_type
            documents_classifies.append(doc)
            print(f"[CLASSIFICATION] {doc.get('doc_id')} → {doc_type}")

        print(f"[CLASSIFICATION] ✅ {len(documents_classifies)} documents classifiés")
        ti.xcom_push(key="documents_classifies", value=documents_classifies)

    # -------------------------------------------------------------------------
    # TASK 3 — OCR
    # Extraction du texte brut depuis les PDFs/images
    # ── MOCKÉ — à remplacer par le vrai module OCR quand il sera prêt ────────
    # -------------------------------------------------------------------------
    def task_ocr(**context):
        """
        Lance l'OCR sur chaque document.
        MOCKÉ pour l'instant — remplacer le bloc MOCK par l'appel au vrai module OCR.
        """
        ti                   = context["ti"]
        documents_classifies = ti.xcom_pull(task_ids="classification", key="documents_classifies")

        documents_ocr = []

        for doc in documents_classifies:
            doc_id   = doc.get("doc_id")
            doc_type = doc.get("doc_type")

            print(f"[OCR] Traitement : {doc_id} ({doc_type})")

            # ── MOCK : remplacer ce bloc par l'appel au vrai module OCR ──────
            texte_extrait = {
                "siret":       doc.get("siret",  "33070384400036"),
                "nom":         doc.get("nom",    "ENTREPRISE EXEMPLE"),
                "montant_ht":  doc.get("montant_ht",  "1000.00"),
                "tva":         doc.get("tva",         "200.00"),
                "montant_ttc": doc.get("montant_ttc", "1200.00"),
                "date":        doc.get("date",        "2026-03-15"),
                "raw_text":    "[TEXTE MOCKÉ — EN ATTENTE DU MODULE OCR]",
            }
            # ─────────────────────────────────────────────────────────────────

            doc["texte_extrait"] = texte_extrait
            documents_ocr.append(doc)

        print(f"[OCR] ✅ {len(documents_ocr)} documents traités")
        ti.xcom_push(key="documents_ocr", value=documents_ocr)

    # -------------------------------------------------------------------------
    # TASK 4 — VALIDATION
    # Détection des incohérences dans les données extraites
    # -------------------------------------------------------------------------
    def task_validation(**context):
        """
        Vérifie pour chaque document :
        - Format SIRET valide (14 chiffres)
        - TVA cohérente avec HT (20%)
        - TTC cohérent avec HT + TVA
        """
        ti            = context["ti"]
        documents_ocr = ti.xcom_pull(task_ids="ocr", key="documents_ocr")

        documents_valides = []

        for doc in documents_ocr:
            doc_id        = doc.get("doc_id")
            texte_extrait = doc.get("texte_extrait", {})
            anomalies     = []

            # ── Vérification SIRET ────────────────────────────────────────────
            siret = texte_extrait.get("siret", "")
            if not siret.isdigit() or len(siret) != 14:
                anomalies.append(f"SIRET invalide : '{siret}'")

            # ── Vérification TVA & TTC ────────────────────────────────────────
            try:
                ht  = float(texte_extrait.get("montant_ht",  0))
                tva = float(texte_extrait.get("tva",         0))
                ttc = float(texte_extrait.get("montant_ttc", 0))

                tva_calculee = round(ht * 0.2,     2)
                ttc_calcule  = round(ht + tva, 2)

                if abs(tva - tva_calculee) > 0.05:
                    anomalies.append(
                        f"TVA incohérente : déclarée={tva}, attendue={tva_calculee}"
                    )
                if abs(ttc - ttc_calcule) > 0.05:
                    anomalies.append(
                        f"TTC incohérent : déclaré={ttc}, attendu={ttc_calcule}"
                    )
            except (ValueError, TypeError) as e:
                anomalies.append(f"Erreur lecture montants : {e}")

            statut     = "invalide" if anomalies else "valide"
            doc["statut"]    = statut
            doc["anomalies"] = anomalies

            print(f"[VALIDATION] {doc_id} → {statut}" +
                  (f" | {anomalies}" if anomalies else ""))

            documents_valides.append(doc)

        nb_valides   = sum(1 for d in documents_valides if d["statut"] == "valide")
        nb_invalides = sum(1 for d in documents_valides if d["statut"] == "invalide")
        print(f"[VALIDATION] ✅ {nb_valides} valides | ⚠️  {nb_invalides} invalides")

        ti.xcom_push(key="documents_valides", value=documents_valides)

    # -------------------------------------------------------------------------
    # TASK 5 — STOCKAGE
    # Sauvegarde de tous les résultats dans MongoDB Atlas
    # -------------------------------------------------------------------------
    def task_stockage(**context):
        """
        Insère tous les documents traités dans MongoDB Atlas.
        Collection cible : filemina.documents
        """
        from pymongo import MongoClient

        ti                = context["ti"]
        documents_valides = ti.xcom_pull(task_ids="validation", key="documents_valides")

        mongo_uri = os.getenv(
            "MONGO_URI",
            "mongodb+srv://kazadiabondance_db_user:gPuMLaiSdi7DcIuf@cluster0.rkvrqbg.mongodb.net/filemina"
        )

        try:
            client     = MongoClient(mongo_uri)
            db         = client["filemina"]
            collection = db["documents"]

            # Prépare les documents à insérer
            a_inserer = []
            for doc in documents_valides:
                a_inserer.append({
                    "doc_id":         doc.get("doc_id"),
                    "doc_type":       doc.get("doc_type"),
                    "lot_id":         doc.get("lot_id"),
                    "statut":         doc.get("statut"),
                    "anomalies":      doc.get("anomalies", []),
                    "donnees":        doc.get("texte_extrait", {}),
                    "chemin_pdf":     doc.get("chemin_pdf", ""),
                    "split":          doc.get("split", ""),
                    "traite_le":      datetime.utcnow().isoformat(),
                })

            if a_inserer:
                result = collection.insert_many(a_inserer)
                print(f"[STOCKAGE] ✅ {len(result.inserted_ids)} documents insérés dans filemina.documents")
            else:
                print("[STOCKAGE] ⚠️  Aucun document à insérer")

            client.close()

        except Exception as e:
            print(f"[STOCKAGE] ❌ Erreur MongoDB : {e}")
            raise

    # =========================================================================
    # Instanciation des tâches
    # =========================================================================
    t1_ingestion      = PythonOperator(
        task_id="ingestion",
        python_callable=task_ingestion,
        provide_context=True,
    )
    t2_classification = PythonOperator(
        task_id="classification",
        python_callable=task_classification,
        provide_context=True,
    )
    t3_ocr            = PythonOperator(
        task_id="ocr",
        python_callable=task_ocr,
        provide_context=True,
    )
    t4_validation     = PythonOperator(
        task_id="validation",
        python_callable=task_validation,
        provide_context=True,
    )
    t5_stockage       = PythonOperator(
        task_id="stockage",
        python_callable=task_stockage,
        provide_context=True,
    )

    # =========================================================================
    # Ordre d'exécution
    # =========================================================================
    t1_ingestion >> t2_classification >> t3_ocr >> t4_validation >> t5_stockage