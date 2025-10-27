from flask import Flask, render_template
from flask_login import LoginManager
from backend.models import db, User
from backend.routes import auth_bp, admin_bp, student_bp, student_forum_bp

def createApp():
    app = Flask(__name__, template_folder='frontend')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_secret_key_here'  # Required for Flask-Login sessions

    # Initialize extensions
    db.init_app(app)

    # --- Flask-Login Setup ---
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login_home'  # Redirect here if @login_required triggers
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # --- Register Blueprints ---
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp) 
    app.register_blueprint(student_bp)
    app.register_blueprint(student_forum_bp)

    # --- Home route ---
    @app.route('/')
    def home():
        return render_template('Home.html')

    # --- Create tables if not exist ---
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = createApp()
    app.run(debug=True)
