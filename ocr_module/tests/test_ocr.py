import os
from pathlib import Path

from ocr_module import OCRProcessor


def test_ocr_on_samples():
    samples_dir = Path("tests/samples")
    output_dir = Path("output_test")

    processor = OCRProcessor(output_dir=output_dir)

    for file in samples_dir.iterdir():
        if file.is_file():
            result = processor.process_file(file)
            assert result is not None
            assert "text" in result
            assert len(result["text"]) > 0

    processor.print_stats()

    # Nettoyage optionnel
    # import shutil
    # shutil.rmtree(output_dir)