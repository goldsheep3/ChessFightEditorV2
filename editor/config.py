"""Configuration for the ChessFight Editor"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Data directories
DATA_DIR = BASE_DIR / "data"
ASSETS_DIR = BASE_DIR / "assets"
IMAGE_DIR = ASSETS_DIR / "image"
LOGS_DIR = BASE_DIR / "logs"

# Global data files
GLOBAL_EFFECTS_FILE = DATA_DIR / "global_effects.json"
GLOBAL_FIXED_TERMS_FILE = DATA_DIR / "global_fixed_terms.json"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
IMAGE_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

def get_set_file_path(set_code: str) -> Path:
    """Get the path to a set JSON file"""
    return DATA_DIR / f"set_{set_code}.json"

def get_set_image_dir(set_code: str) -> Path:
    """Get the image directory for a specific set"""
    path = IMAGE_DIR / set_code
    path.mkdir(parents=True, exist_ok=True)
    return path
