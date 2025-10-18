from flask import render_template, request, redirect, url_for, Blueprint, flash
from flask_login import login_user, logout_user, login_required, current_user
from backend.models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login/<role>', methods=['GET', 'POST'])
def login_role(role):
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email, role=role).first()
        if user and user.check_password(password):
            login_user(user)
            flash(f'{role.capitalize()} login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials or role mismatch.', 'danger')

    page_map = {
        'student': 'StudentLogin.html',
        'vendor': 'VendorLogin.html',
        'admin': 'AdminLogin.html'
    }
    return render_template(page_map.get(role, 'Home.html'))


# ------------------- REGISTER ROUTES -------------------

@auth_bp.route('/register/admin', methods=['GET', 'POST'])
def register_admin():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        if User.query.filter_by(email=email).first():
            flash('Email already exists!', 'warning')
            return redirect(url_for('auth.register_admin'))

        user = User(name=name, email=email, role='admin')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('Admin registration successful! Please login.', 'success')
        return redirect(url_for('auth.login_role', role='admin'))

    return render_template('AdminRegister.html')


@auth_bp.route('/register/vendor', methods=['GET', 'POST'])
def register_vendor():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        if User.query.filter_by(email=email).first():
            flash('Email already exists!', 'warning')
            return redirect(url_for('auth.register_vendor'))

        user = User(name=name, email=email, role='vendor')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('Vendor registration successful! Please login.', 'success')
        return redirect(url_for('auth.login_role', role='vendor'))

    return render_template('VendorRegister.html')


@auth_bp.route('/register/student', methods=['GET', 'POST'])
def register_student():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        if User.query.filter_by(email=email).first():
            flash('Email already exists!', 'warning')
            return redirect(url_for('auth.register_student'))

        user = User(name=name, email=email, role='student')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('Student registration successful! Please login.', 'success')
        return redirect(url_for('auth.login_role', role='student'))

    return render_template('StudentRegister.html')
