from flask import render_template, request, redirect, url_for, Blueprint

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login_home():
    # Main login page asking role
    return render_template('Home.html')

@auth_bp.route('/login/<role>', methods=['GET', 'POST'])
def login_role(role):
    if request.method == 'POST':
        # Example: you can add actual authentication logic here
        return redirect(url_for('home'))
    else:
        page_map = {
            'student': 'StudentLogin.html',
            'vendor': 'VendorLogin.html',
            'admin': 'AdminLogin.html'
        }
        return render_template(page_map.get(role, 'Home.html'))
    
