from copy import deepcopy
import random
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP


def to_decimal(value):
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def corrompre_siret_malforme(doc):
    nb_chiffres_a_retirer = random.choice([1, 2])
    doc["fournisseur_siret"] = doc["fournisseur_siret"][:-nb_chiffres_a_retirer]
    return doc


def corrompre_siret_mismatch(doc):
    siret = str(doc["fournisseur_siret"])

    if len(siret) != 14 or not siret.isdigit():
        raise ValueError("L'anomalie siret_mismatch attend un SIRET deja bien forme.")

    dernier_chiffre = siret[-1]
    nouveau_chiffre = random.choice([chiffre for chiffre in "0123456789" if chiffre != dernier_chiffre])
    doc["fournisseur_siret"] = siret[:-1] + nouveau_chiffre
    return doc


def corrompre_nom_mismatch(doc):
    nom = str(doc["fournisseur_nom"]).strip()

    variantes = [
        f"{nom} SA",
        f"{nom} GROUPE",
        f"{nom} SERVICES",
    ]
    doc["fournisseur_nom"] = random.choice([variante for variante in variantes if variante != nom])
    return doc


def corrompre_tva(doc):
    mauvais_taux = random.choice([0.05, 0.10, 0.15])
    doc["tva"] = to_decimal(doc["total_ht"] * Decimal(str(mauvais_taux)))
    doc["total_ttc"] = to_decimal(doc["total_ht"] + doc["tva"])
    return doc


def corrompre_ttc(doc):
    ecart = to_decimal(random.uniform(50, 500))
    doc["total_ttc"] = to_decimal(doc["total_ttc"] + ecart)
    return doc


def corrompre_iban(doc):
    if doc.get("type") != "facture":
        raise ValueError("L'anomalie iban_invalide ne s'applique qu'aux factures.")

    doc["iban"] = random.choice([
        "FR76 1234 5678",
        "FR76 1234 5678 9012 3456 7890 1234",
    ])
    return doc


def corrompre_bic(doc):
    if doc.get("type") != "facture":
        raise ValueError("L'anomalie bic_invalide ne s'applique qu'aux factures.")

    doc["bic"] = random.choice([
        "ABCDEF",
        "ABCDEFGHIJK",
    ])
    return doc


def corrompre_format_date(doc):
    champ_date = random.choice(["date_emission", "date_echeance"])
    formats_invalides = [
        "2026-03-17",
        "17-03-2026",
        "17/3/2026",
        "2026/03/17",
        "17032026",
    ]
    doc[champ_date] = random.choice(formats_invalides)
    return doc


def corrompre_echeance_depassee(doc):
    # La règle change selon le type de document
    type_document = doc.get("type")

    if type_document == "facture":
        date_emission = date.today() - timedelta(days=random.randint(0, 180))
        date_echeance = date_emission - timedelta(days=random.randint(1, 30))
        doc["date_emission"] = date_emission
        doc["date_echeance"] = date_echeance
        return doc

    if type_document in ["devis", "attestation"]:
        doc["date_echeance"] = date.today() - timedelta(days=random.randint(1, 60))
        return doc

    raise ValueError(
        f"Le type de document {type_document} ne gere pas l'anomalie echeance_depassee."
    )


def corrompre_document(document, anomalie):
    # Applique une anomalie spécifique à un document donné
    doc = deepcopy(document)

    if anomalie == "siret_malforme":
        doc = corrompre_siret_malforme(doc)
    elif anomalie == "siret_mismatch":
        doc = corrompre_siret_mismatch(doc)
    elif anomalie == "nom_mismatch":
        doc = corrompre_nom_mismatch(doc)
    elif anomalie == "iban_invalide":
        doc = corrompre_iban(doc)
    elif anomalie == "bic_invalide":
        doc = corrompre_bic(doc)
    elif anomalie == "tva_incoherente":
        doc = corrompre_tva(doc)
    elif anomalie == "ttc_incorrect":
        doc = corrompre_ttc(doc)
    elif anomalie == "format_date_invalide":
        doc = corrompre_format_date(doc)
    elif anomalie == "echeance_depassee":
        doc = corrompre_echeance_depassee(doc)
    else:
        raise ValueError(f"Anomalie inconnue : {anomalie}")

    doc["coherent"] = False
    doc["anomalie"] = anomalie
    return doc
