"""Flask application factory"""
from flask import Flask, render_template, send_from_directory
from chessfight_editor.config import BASE_DIR, IMAGE_DIR

def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__, 
                template_folder=str(BASE_DIR / 'chessfight_editor' / 'templates'),
                static_folder=str(BASE_DIR / 'chessfight_editor' / 'static'))
    
    # Register blueprints
    from chessfight_editor import routes_set, routes_global
    app.register_blueprint(routes_set.bp)
    app.register_blueprint(routes_global.bp)
    
    # Serve assets
    @app.route('/assets/image/<path:filename>')
    def serve_image(filename):
        return send_from_directory(IMAGE_DIR, filename)
    
    # Main routes
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/editor/<set_code>')
    def editor(set_code):
        return render_template('editor.html', set_code=set_code)
    
    @app.route('/global/effects')
    def global_effects():
        return render_template('global_effects.html')
    
    @app.route('/global/fixed-terms')
    def global_fixed_terms():
        return render_template('global_fixed_terms.html')
    
    return app

def main():
    """Main entry point"""
    import os
    
    app = create_app()
    
    # Only enable debug mode if explicitly set via environment variable
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 'yes')
    
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
