import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_DIR / ".env"
RAW_SIRENE_DIR = ROOT_DIR / "data" / "raw" / "sirene"


class SireneClientError(Exception):
    """Erreur liee a la recuperation des donnees SIRENE."""


def _raise_error(message, error=None):
    # On affiche un message clair avant de lever une exception.
    print(message)
    if error is None:
        raise SireneClientError(message)
    raise SireneClientError(message) from error


def _read_json_file(file_path):
    try:
        return json.loads(file_path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        _raise_error(f"Erreur : fichier introuvable : {file_path}", error)
    except json.JSONDecodeError as error:
        _raise_error(f"Erreur : JSON invalide dans le fichier {file_path}", error)


def _save_raw_json(siret, data):
    RAW_SIRENE_DIR.mkdir(parents=True, exist_ok=True)
    raw_file = RAW_SIRENE_DIR / f"{siret}.json"
    raw_file.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _extract_entreprise(data):
    etablissement = data.get("etablissement", {})
    unite_legale = etablissement.get("uniteLegale", {})
    adresse = etablissement.get("adresseEtablissement", {})

    adresse_complete = " ".join(
        part
        for part in [
            adresse.get("numeroVoieEtablissement"),
            adresse.get("typeVoieEtablissement"),
            adresse.get("libelleVoieEtablissement"),
        ]
        if part
    )

    ville_complete = " ".join(
        part
        for part in [
            adresse.get("codePostalEtablissement"),
            adresse.get("libelleCommuneEtablissement"),
        ]
        if part
    )

    return {
        "siret": etablissement.get("siret"),
        "siren": etablissement.get("siren"),
        "nom": unite_legale.get("denominationUniteLegale"),
        "adresse": adresse_complete,
        "ville": ville_complete,
        "forme_juridique": unite_legale.get("categorieJuridiqueUniteLegale"),
        "code_naf": etablissement.get("activitePrincipaleEtablissement"),
        "date_creation": etablissement.get("dateCreationEtablissement"),
    }


def get_entreprise(siret):
    # On charge la cle API INSEE depuis le fichier .env a la racine.
    load_dotenv(dotenv_path=ENV_PATH)
    api_key = os.getenv("INSEE_API_KEY")

    if not api_key:
        _raise_error("Erreur : la variable INSEE_API_KEY est absente du fichier .env")

    if not siret:
        _raise_error("Erreur : aucun SIRET fourni a get_entreprise().")

    raw_file = RAW_SIRENE_DIR / f"{siret}.json"

    # On reutilise le JSON local s'il existe deja pour eviter un appel API
    if raw_file.exists():
        data = _read_json_file(raw_file)
        return _extract_entreprise(data)

    try:
        response = requests.get(
            f"https://api.insee.fr/api-sirene/3.11/siret/{siret}",
            headers={"X-INSEE-Api-Key-Integration": api_key},
            timeout=15,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout as error:
        _raise_error(
            f"Erreur : delai depasse lors de l'appel SIRENE pour le SIRET {siret}.",
            error,
        )
    except requests.exceptions.HTTPError as error:
        status_code = error.response.status_code if error.response else "inconnu"
        _raise_error(
            f"Erreur HTTP {status_code} lors de l'appel SIRENE pour le SIRET {siret}.",
            error,
        )
    except requests.exceptions.RequestException as error:
        _raise_error(
            f"Erreur reseau lors de l'appel SIRENE pour le SIRET {siret}.",
            error,
        )

    try:
        data = response.json()
    except ValueError as error:
        _raise_error(
            f"Erreur : la reponse de l'API SIRENE pour le SIRET {siret} n'est pas un JSON valide.",
            error,
        )

    _save_raw_json(siret, data)
    return _extract_entreprise(data)
