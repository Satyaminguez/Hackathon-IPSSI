import re
import os

class SilverExtractor:
    def __init__(self, text, file_path):
        self.text = text
        self.file_path = file_path
        self.lines = [l.strip() for l in text.split("\n") if l.strip()]

    # ---------------------------------------------------------
    # TYPE DE DOCUMENT
    # ---------------------------------------------------------
    def detect_type(self):
        t = self.text.lower()

        # mots-clés forts
        if "facture" in t:
            return "facture"
        if "devis" in t:
            return "devis"
        if "urssaf" in t or "attestation" in t or "certificat" in t:
            return "attestation"

        # structure facture
        if "total ht" in t or "total ttc" in t or "tva" in t:
            return "facture"

        # structure devis
        if "validité du devis" in t or "acceptation du devis" in t:
            return "devis"

        return "inconnu"

    # ---------------------------------------------------------
    # DOC ID
    # ---------------------------------------------------------
    def extract_doc_id(self):
        # 1) OCR
        m = re.search(r"(FAC|DEV|URS)-\d{4}-\d{4}_\d{14}", self.text)
        if m:
            return m.group(0)

        # 2) Nom fichier
        m = re.search(r"(FAC|DEV|URS)-\d{4}-\d{4}_\d{14}", self.file_path)
        if m:
            return m.group(0)

        # 3) fallback
        return os.path.basename(self.file_path).replace(".pdf", "")

    # ---------------------------------------------------------
    # LOT ID
    # ---------------------------------------------------------
    def extract_lot_id(self):
        return "LOT-0001"

    # ---------------------------------------------------------
    # SIRET fournisseur + client
    # ---------------------------------------------------------
    def extract_sirets(self):
        sirets = re.findall(r"\b\d{14}\b", self.text)
        fournisseur = sirets[0] if len(sirets) >= 1 else None
        client = sirets[1] if len(sirets) >= 2 else None
        return fournisseur, client

    # ---------------------------------------------------------
    # NOMS FOURNISSEUR / CLIENT
    # ---------------------------------------------------------
    def extract_parties(self):
        fournisseur = None
        client = None

        for i, line in enumerate(self.lines):
            if "fournisseur" in line.lower() and "client" in line.lower():
                if i + 1 < len(self.lines):
                    next_line = self.lines[i+1]
                    parts = next_line.split()

                    if len(parts) >= 2:
                        fournisseur = " ".join(parts[:2])
                        client = " ".join(parts[2:]) if len(parts) > 2 else None
                break

        return fournisseur, client

    # ---------------------------------------------------------
    # DATES
    # ---------------------------------------------------------
    def extract_dates(self):
        em = re.search(r"Date d[' ]?emission\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})", self.text, re.I)
        ech = re.search(r"Date d[' ]?echeance\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})", self.text, re.I)

        return (
            em.group(1) if em else None,
            ech.group(1) if ech else None
        )

    # ---------------------------------------------------------
    # MONTANTS
    # ---------------------------------------------------------
    def extract_amounts(self):
        def to_float(x):
            return float(x.replace(",", ".")) if x else None

        ht = re.search(r"Total HT\s+(\d+[.,]\d{2})", self.text, re.I)
        tva = re.search(r"TVA.*?(\d+[.,]\d{2})\s*EUR", self.text, re.I)
        ttc = re.search(r"Total TTC\s+(\d+[.,]\d{2})", self.text, re.I)

        return {
            "total_ht": to_float(ht.group(1)) if ht else None,
            "tva": to_float(tva.group(1)) if tva else None,
            "total_ttc": to_float(ttc.group(1)) if ttc else None
        }

    # ---------------------------------------------------------
    # IBAN / BIC
    # ---------------------------------------------------------
    def extract_iban_bic(self):
        iban = re.search(r"\bFR[0-9A-Z ]{10,}\b", self.text)
        bic = re.search(r"\b[A-Z0-9]{8,11}\b", self.text)

        return {
            "iban": iban.group(0).replace(" ", "") if iban else None,
            "bic": bic.group(0) if bic else None
        }

    # ---------------------------------------------------------
    # COHÉRENCE
    # ---------------------------------------------------------
    def check_coherence(self, fournisseur_siret):
        if fournisseur_siret and len(fournisseur_siret) == 14:
            return True, None
        return False, "siret_mismatch"

    # ---------------------------------------------------------
    # EXTRACTION GLOBALE
    # ---------------------------------------------------------
    def extract_all(self):
        doc_type = self.detect_type()
        fournisseur_siret, client_siret = self.extract_sirets()
        fournisseur_nom, client_nom = self.extract_parties()
        date_emission, date_echeance = self.extract_dates()
        amounts = self.extract_amounts()
        iban_bic = self.extract_iban_bic()

        coherent, anomalie = self.check_coherence(fournisseur_siret)

        return {
            "type": doc_type,
            "doc_id": self.extract_doc_id(),
            "lot_id": self.extract_lot_id(),
            "fournisseur_siret": fournisseur_siret,
            "fournisseur_nom": fournisseur_nom,
            "client_nom": client_nom,
            "client_siret": client_siret,
            "iban": iban_bic["iban"],
            "bic": iban_bic["bic"],
            "date_emission": date_emission,
            "date_echeance": date_echeance,
            "total_ht": amounts["total_ht"],
            "tva": amounts["tva"],
            "total_ttc": amounts["total_ttc"],
            "chemin_fichier": self.file_path,
            "coherent": coherent,
            "anomalie": anomalie
        }