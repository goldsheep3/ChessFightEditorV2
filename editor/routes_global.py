"""Routes for global library management"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from editor.config import GLOBAL_EFFECTS_FILE, GLOBAL_FIXED_TERMS_FILE
from editor.utils import read_json_file, write_json_file
from editor.models import GlobalEffectsSchema, GlobalFixedTermsSchema

bp = Blueprint('global', __name__, url_prefix='/api/global')

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
