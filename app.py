from flask import Flask, render_template
from backend.models import db
from backend.routes import auth_bp

def createApp():
    app = Flask(__name__, template_folder='frontend')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)

    # Home route
    @app.route('/')
    def home():
        return render_template('Home.html')

    # Create tables if not exist
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = createApp()
    app.run(debug=True)
