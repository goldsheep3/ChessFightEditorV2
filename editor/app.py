"""Flask application factory"""
from flask import Flask, send_from_directory, send_file
from editor.config import BASE_DIR, IMAGE_DIR
from pathlib import Path

def create_app():
    """Create and configure Flask app"""
    # Point static folder to the Vue build output
    dist_folder = BASE_DIR / 'editor' / 'static' / 'dist'
    
    app = Flask(__name__, 
                static_folder=str(dist_folder),
                static_url_path='')
    
    # Register blueprints
    from editor import routes_set, routes_global
    app.register_blueprint(routes_set.bp)
    app.register_blueprint(routes_global.bp)
    
    # Serve assets
    @app.route('/assets/image/<path:filename>')
    def serve_image(filename):
        return send_from_directory(IMAGE_DIR, filename)
    
    # Serve Vue SPA for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        # If path is a file in dist folder, serve it
        if path and (dist_folder / path).exists():
            return send_from_directory(dist_folder, path)
        # Otherwise serve index.html for Vue Router
        return send_file(dist_folder / 'index.html')
    
    return app

def main():
    """Main entry point"""
    import os
    
    app = create_app()
    
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
