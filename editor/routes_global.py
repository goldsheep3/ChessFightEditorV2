"""Routes for global library management"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from werkzeug.utils import secure_filename

from editor.config import GLOBAL_EFFECTS_FILE, GLOBAL_FIXED_TERMS_FILE, IMAGE_DIR
from editor.utils import read_json_file, write_json_file
from editor.models import GlobalEffectsSchema, GlobalFixedTermsSchema

bp = Blueprint('global', __name__, url_prefix='/api/global')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    parts = filename.rsplit('.', 1)
    return len(parts) == 2 and parts[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/effects', methods=['GET'])
def get_global_effects():
    """Get global effects library (without validation)"""
    try:
        data = read_json_file(GLOBAL_EFFECTS_FILE, default={"effects": {}})
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/effects', methods=['POST'])
def save_global_effects():
    """Save global effects library (with validation)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate with Pydantic
        try:
            validated = GlobalEffectsSchema(**data)
            validated_data = validated.model_dump()
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400
        
        # Save to file
        write_json_file(GLOBAL_EFFECTS_FILE, validated_data)
        
        return jsonify({"message": "Global effects saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/fixed-terms', methods=['GET'])
def get_global_fixed_terms():
    """Get global fixed terms library (without validation)"""
    try:
        data = read_json_file(GLOBAL_FIXED_TERMS_FILE, default={"fixed_terms": {}})
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/fixed-terms', methods=['POST'])
def save_global_fixed_terms():
    """Save global fixed terms library (with validation)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate with Pydantic
        try:
            validated = GlobalFixedTermsSchema(**data)
            validated_data = validated.model_dump()
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.errors()}), 400
        
        # Save to file
        write_json_file(GLOBAL_FIXED_TERMS_FILE, validated_data)
        
        return jsonify({"message": "Global fixed terms saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Image management routes
@bp.route('/images/all', methods=['GET'])
def list_all_images():
    """List all images in the gallery"""
    try:
        if not IMAGE_DIR.exists():
            return jsonify({"images": []}), 200
        
        images = []
        
        # Recursively scan all subdirectories in IMAGE_DIR
        for file_path in IMAGE_DIR.rglob('*'):
            if file_path.is_file() and allowed_file(file_path.name):
                # Get relative path from IMAGE_DIR
                relative_path = file_path.relative_to(IMAGE_DIR)
                # Convert to URL path (use forward slashes)
                url_path = str(relative_path).replace('\\', '/')
                
                images.append({
                    "name": file_path.name,
                    "url": f"/assets/image/{url_path}"
                })
        
        # Sort by name
        images.sort(key=lambda x: x['name'])
        
        return jsonify({"images": images}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/images/upload/<folder>', methods=['POST'])
def upload_gallery_image(folder):
    """Upload an image to the gallery"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400
        
        # Validate folder name
        if folder != 'root' and not folder.replace('_', '').replace('-', '').isalnum():
            return jsonify({"error": "Invalid folder name"}), 400
        
        # Create folder directory
        if folder == 'root':
            image_dir = IMAGE_DIR
        else:
            image_dir = IMAGE_DIR / folder
            image_dir.mkdir(parents=True, exist_ok=True)
        
        # Secure the filename
        filename = secure_filename(file.filename)
        file_path = image_dir / filename
        
        # Save the file
        file.save(str(file_path))
        
        # Return relative URL
        if folder == 'root':
            relative_url = f"/assets/image/{filename}"
        else:
            relative_url = f"/assets/image/{folder}/{filename}"
        
        return jsonify({"url": relative_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
