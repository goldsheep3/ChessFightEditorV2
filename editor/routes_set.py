"""Routes for set management"""
import os
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from pydantic import ValidationError

from editor.config import get_set_file_path, get_set_image_dir, IMAGE_DIR
from editor.utils import read_json_file, write_json_file, list_all_sets
from editor.models import SetSchemaV2

bp = Blueprint('set', __name__, url_prefix='/api/set')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    parts = filename.rsplit('.', 1)
    return len(parts) == 2 and parts[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/list', methods=['GET'])
def list_sets():
    """List all available sets"""
    try:
        sets = list_all_sets()
        return jsonify({"sets": sets}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<set_code>', methods=['GET'])
def get_set(set_code):
    """Get a specific set data (without validation)"""
    try:
        file_path = get_set_file_path(set_code)
        data = read_json_file(file_path)
        
        if not data:
            return jsonify({"error": "Set not found"}), 404
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<set_code>', methods=['POST'])
def save_set(set_code):
    """Save set data (with validation)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate with Pydantic
        try:
            validated = SetSchemaV2(**data)
            validated_data = validated.model_dump()
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400
        
        # Save to file
        file_path = get_set_file_path(set_code)
        write_json_file(file_path, validated_data)
        
        return jsonify({"message": "Set saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<set_code>', methods=['DELETE'])
def delete_set(set_code):
    """Delete a set"""
    try:
        file_path = get_set_file_path(set_code)
        
        if not file_path.exists():
            return jsonify({"error": "Set not found"}), 404
        
        file_path.unlink()
        return jsonify({"message": "Set deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/upload/<set_code>/<field_name>', methods=['POST'])
def upload_image(set_code, field_name):
    """Upload an image for a set"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400
        
        # Create set-specific directory
        image_dir = get_set_image_dir(set_code)
        
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Add prefix based on field name to avoid collisions
        prefixed_filename = f"{field_name}_{filename}"
        
        file_path = image_dir / prefixed_filename
        file.save(str(file_path))
        
        # Return relative URL
        relative_url = f"/assets/image/{set_code}/{prefixed_filename}"
        
        return jsonify({"url": relative_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
