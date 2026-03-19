import hashlib
import json


def attribuer_split_lot(lot_id):
    # On fait un hash pour faire le split 
    valeur = int(hashlib.md5(lot_id.encode("utf-8")).hexdigest(), 16) % 10

    if valeur < 8:
        return "train"

    return "test"


def generer_splits_depuis_metadata(metadata_path, split_path):
    metadata_documents = json.loads(metadata_path.read_text(encoding="utf-8"))
    # Le split se fait par lot pour garder ensemble tous les documents liés (pour faire les comparaisons après)
    lots = sorted({document["lot_id"] for document in metadata_documents})
    splits = {"train": [], "test": []}

    for lot_id in lots:
        split = attribuer_split_lot(lot_id)
        splits[split].append(lot_id)

    # On stocke dans un autre fichier
    split_path.parent.mkdir(parents=True, exist_ok=True)
    split_path.write_text(
        json.dumps(splits, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return splits
