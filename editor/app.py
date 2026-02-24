"""Flask application factory"""
from flask import Flask, send_from_directory, send_file, request, jsonify
from editor.config import BASE_DIR, IMAGE_DIR
from pathlib import Path

def create_app():
    """Create and configure Flask app"""
    # Point static folder to the Vue build output
    dist_folder = BASE_DIR / 'editor' / 'static' / 'dist'
    
    app = Flask(__name__, 
                static_folder=str(dist_folder),
                static_url_path='')
    
    # Serve assets
    @app.route('/assets/image/<path:filename>')
    def serve_image(filename):
        return send_from_directory(IMAGE_DIR, filename)
    
    # Register blueprints (API routes)
    from editor import routes_set, routes_global
    app.register_blueprint(routes_set.bp)
    app.register_blueprint(routes_global.bp)
    
    # Serve Vue SPA for all non-API routes (must be last)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        # If path is a file in dist folder (like assets), serve it
        file_path = dist_folder / path
        if path and file_path.exists() and file_path.is_file():
            return send_from_directory(dist_folder, path)
        # Otherwise serve index.html for Vue Router (SPA)
        return send_file(dist_folder / 'index.html')
    
    # Handle 404 errors by serving the SPA
    @app.errorhandler(404)
    def not_found(e):
        # For API routes, return JSON error
        if request.path.startswith('/api/'):
            return jsonify({"error": "Not found"}), 404
        # For all other routes, serve the SPA (let Vue Router handle it)
        return send_file(dist_folder / 'index.html')
    
    return app

def main():
    """Main entry point"""
    import os
    
    app = create_app()
    
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
