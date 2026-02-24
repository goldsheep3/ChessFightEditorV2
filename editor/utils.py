"""Utility functions for file operations"""
import json
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)

def read_json_file(file_path: Path, default: Any = None) -> Dict:
    """Read JSON file, return default if not exists"""
    if not file_path.exists():
        return default if default is not None else {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error reading {file_path}: {e}")
        return default if default is not None else {}

def write_json_file(file_path: Path, data: Dict) -> None:
    """Write data to JSON file with pretty formatting"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def list_all_sets() -> list:
    """List all set files in the data directory"""
    from editor.config import DATA_DIR
    
    sets = []
    for file_path in DATA_DIR.glob("set_*.json"):
        set_code = file_path.stem.replace("set_", "")
        try:
            data = read_json_file(file_path)
            sets.append({
                "set_code": set_code,
                "name": data.get("name", set_code),
                "description": data.get("description", "")
            })
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error reading set {set_code}: {e}")
    
    return sets
