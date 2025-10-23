from flask import render_template, request, redirect, url_for, Blueprint, flash
from flask_login import login_user, logout_user, login_required, current_user
from backend.models import db, User, Item, Order, OrderDetails, BillInvoice, ForumComment, ForumPost, ShoppingCart
from flask import Blueprint, render_template, request, redirect, url_for, flash, abort, jsonify
from flask_login import login_required, current_user
from werkzeug.exceptions import NotFound
from sqlalchemy.exc import SQLAlchemyError

auth_bp = Blueprint('auth', __name__)
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
student_bp = Blueprint('student', __name__, url_prefix='/student')

@auth_bp.route('/login/<role>', methods=['GET', 'POST'])
def login_role(role):
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email, role=role).first()
        if user and user.check_password(password):
            login_user(user)
            flash(f'{role.capitalize()} login successful!', 'success')

            # Redirect based on role
            if role == 'admin':
                return redirect(url_for('admin.dashboard'))
            elif role == 'vendor':
                return redirect(url_for('vendor.dashboard'))
            elif role == 'student':
                return redirect(url_for('student.dashboard'))
            else:
                return redirect(url_for('home'))

        else:
            flash('Invalid credentials or role mismatch.', 'danger')

    # Load appropriate login page
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


def admin_required(f):
    """Decorator to restrict access to admin users only."""
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))
        # adjust role check if you have different role values
        if getattr(current_user, 'role', None) != 'admin':
            flash('Admin access required', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)

    return decorated


# ---------- Dashboard ----------

@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    """Simple admin home that links to market/forum admin pages."""
    total_items = Item.query.count()
    total_users = User.query.count()
    total_orders = Order.query.count()
    return render_template('AdminDashboard.html', total_items=total_items, total_users=total_users, total_orders=total_orders)


# ---------- MARKET: items, users, transactions ----------

# ITEMS list (default)
@admin_bp.route('/market/items')
@login_required
@admin_required
def market_items():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    items = Item.query.order_by(Item.itemID.desc()).paginate(page=page, per_page=per_page)
    return render_template('admin/market_items.html', items=items)


# ITEM detail and delete
@admin_bp.route('/market/items/<int:item_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def market_item_detail(item_id):
    item = Item.query.get_or_404(item_id)

    if request.method == 'POST':
        # action: delete
        action = request.form.get('action')
        if action == 'delete':
            try:
                db.session.delete(item)
                db.session.commit()
                flash(f'Item {item.title} deleted', 'success')
                return redirect(url_for('admin.market_items'))
            except SQLAlchemyError as e:
                db.session.rollback()
                flash(f'Error deleting item: {e}', 'danger')
        # You can extend to support update from this page

    return render_template('admin/market_item_detail.html', item=item)


# USERS list (students, vendors) - filter by role if provided
@admin_bp.route('/market/users')
@login_required
@admin_required
def market_users():
    role = request.args.get('role')  # None|student|vendor|admin
    page = request.args.get('page', 1, type=int)
    per_page = 20
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.userID.desc()).paginate(page=page, per_page=per_page)
    return render_template('admin/market_users.html', users=users, role=role)


# USER create
@admin_bp.route('/market/users/create', methods=['GET', 'POST'])
@login_required
@admin_required
def market_user_create():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role', 'student')

        if not (name and email and password):
            flash('Name, email and password are required', 'warning')
            return redirect(url_for('admin.market_user_create'))

        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'warning')
            return redirect(url_for('admin.market_user_create'))

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        try:
            db.session.add(user)
            db.session.commit()
            flash('User created', 'success')
            return redirect(url_for('admin.market_users'))
        except SQLAlchemyError as e:
            db.session.rollback()
            flash(f'Error creating user: {e}', 'danger')

    return render_template('admin/market_user_form.html')


# USER update
@admin_bp.route('/market/users/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def market_user_edit(user_id):
    user = User.query.get_or_404(user_id)
    if request.method == 'POST':
        user.name = request.form.get('name', user.name)
        user.email = request.form.get('email', user.email)
        role = request.form.get('role')
        if role:
            user.role = role
        password = request.form.get('password')
        if password:
            user.set_password(password)

        try:
            db.session.commit()
            flash('User updated', 'success')
            return redirect(url_for('admin.market_users'))
        except SQLAlchemyError as e:
            db.session.rollback()
            flash(f'Error updating user: {e}', 'danger')

    return render_template('admin/market_user_form.html', user=user)

'''
# USER delete
@admin_bp.route('/market/users/<int:user_id>/delete', methods=['POST'])
@login_required
@admin_required
def market_user_delete(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        flash('User deleted', 'success')
    except SQLAlchemyError as e:
        db.session.rollback()
        flash(f'Error deleting user: {e}', 'danger')
    return redirect(url_for('admin.market_users'))
'''
@admin_bp.route("/market/user/<int:user_id>/delete", methods=["POST"])
@login_required
@admin_required
def market_user_delete(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash("User deleted successfully!", "success")
    return redirect(url_for("admin.market_users"))


# TRANSACTION HISTORY - simple view of orders/bills
@admin_bp.route('/market/transactions')
@login_required
@admin_required
def market_transactions():
    page = request.args.get('page', 1, type=int)
    per_page = 30
    orders = Order.query.order_by(Order.orderDate.desc()).paginate(page=page, per_page=per_page)
    return render_template('admin/market_transactions.html', orders=orders)


# TRANSACTION detail
@admin_bp.route('/market/transactions/<int:order_id>')
@login_required
@admin_required
def market_transaction_detail(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('admin/market_transaction_detail.html', order=order)

# FORUM POSTS LIST
@admin_bp.route('/forum/posts')
@login_required
@admin_required
def forum_posts():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    posts = ForumPost.query.order_by(ForumPost.timestamp.desc()).paginate(page=page, per_page=per_page)
    return render_template('admin/forum_posts.html', posts=posts)


# FORUM POST DETAIL & DELETE
@admin_bp.route('/forum/posts/<int:post_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def forum_post_detail(post_id):
    post = ForumPost.query.get_or_404(post_id)

    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'delete':
            try:
                # Delete all comments first
                for comment in post.comments:
                    comment.deleteComment()
                post.deletePost()
                flash(f'Post "{post.title}" deleted successfully', 'success')
                return redirect(url_for('admin.forum_posts'))
            except Exception as e:
                db.session.rollback()
                flash(f'Error deleting post: {e}', 'danger')

    return render_template('admin/forum_post_detail.html', post=post)


# FORUM COMMENTS LIST
@admin_bp.route('/forum/comments')
@login_required
@admin_required
def forum_comments():
    page = request.args.get('page', 1, type=int)
    per_page = 30
    comments = ForumComment.query.order_by(ForumComment.timestamp.desc()).paginate(page=page, per_page=per_page)
    return render_template('admin/forum_comments.html', comments=comments)


# DELETE COMMENT
@admin_bp.route('/forum/comments/<int:comment_id>/delete', methods=['POST'])
@login_required
@admin_required
def forum_comment_delete(comment_id):
    comment = ForumComment.query.get_or_404(comment_id)
    try:
        comment.deleteComment()
        flash('Comment deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting comment: {e}', 'danger')
    return redirect(url_for('admin.forum_comments'))



@student_bp.route("/dashboard")
@login_required
def dashboard():
    return render_template("student/dashboard.html")

from flask import request

@student_bp.route("/marketplace", methods=["GET", "POST"])
@login_required
def marketplace():
    query = request.args.get("q", "")
    items_query = Item.query.filter(Item.availability > 0)

    if query:
        items_query = items_query.filter(
            db.or_(
                Item.title.ilike(f"%{query}%"),
                Item.category.ilike(f"%{query}%")
            )
        )

    items = items_query.order_by(Item.itemID.desc()).all()
    return render_template("student/marketplace.html", items=items)

@student_bp.route("/add_to_cart/<int:item_id>", methods=["POST"])
@login_required
def add_to_cart(item_id):
    item = Item.query.get_or_404(item_id)
    quantity = int(request.form.get("quantity", 1))
    ShoppingCart.addToCart(current_user, item, quantity)
    flash(f"Added {quantity} × {item.title} to your cart.", "success")
    return redirect(url_for("student.cart"))

@student_bp.route('/student/add_item', methods=['GET', 'POST'])
@login_required
def add_item():
    # Only allow students to add items
    if current_user.role != 'student':
        flash("Unauthorized access", "danger")
        return redirect(url_for('student.dashboard'))

    if request.method == 'POST':
        title = request.form.get('title')
        category = request.form.get('category')
        price = request.form.get('price')
        availability = request.form.get('availability', 0)

        # Basic validation
        if not title or not price:
            flash("Title and price are required.", "warning")
            return redirect(url_for('student.add_item'))

        try:
            new_item = Item(
                title=title,
                category=category,
                price=float(price),
                availability=int(availability),
                sellerID=current_user.userID  # ✅ assign current student as seller
            )

            db.session.add(new_item)
            db.session.commit()

            flash(f"Item '{title}' added successfully!", "success")
            return redirect(url_for('student.dashboard'))

        except Exception as e:
            db.session.rollback()
            flash(f"Error adding item: {e}", "danger")

    return render_template('student/add_item.html')

@student_bp.route("/forum")
@login_required
def forum():
    posts = ForumPost.query.order_by(ForumPost.timestamp.desc()).all()
    return render_template("student/forum.html", posts=posts, active_page="forum")

@student_bp.route("/forum/<int:post_id>")
@login_required
def forum_post_detail(post_id):
    post = ForumPost.query.get_or_404(post_id)
    return render_template("student/forum_post_detail.html", post=post, active_page="forum")


@student_bp.route("/cart")
@login_required
def cart():
    cart_items = ShoppingCart.query.filter_by(userID=current_user.userID).all()
    return render_template("student/cart.html", cart_items=cart_items, active_page="cart")


@student_bp.route("/cart/<int:cart_id>/update", methods=["POST"])
@login_required
def update_cart(cart_id):
    cart_item = ShoppingCart.query.get_or_404(cart_id)
    if cart_item.userID != current_user.userID:
        abort(403)
    try:
        qty = int(request.form.get("quantity", 1))
        if qty <= 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = qty
        db.session.commit()
        flash("Cart updated successfully.", "success")
    except Exception as e:
        db.session.rollback()
        flash(f"Error updating cart: {e}", "danger")
    return redirect(url_for("student.cart"))


@student_bp.route("/cart/<int:cart_id>/remove", methods=["POST"])
@login_required
def remove_from_cart(cart_id):
    cart_item = ShoppingCart.query.get_or_404(cart_id)
    if cart_item.userID != current_user.userID:
        abort(403)
    try:
        db.session.delete(cart_item)
        db.session.commit()
        flash(f"{cart_item.item.title} removed from cart.", "success")
    except Exception as e:
        db.session.rollback()
        flash(f"Error removing item: {e}", "danger")
    return redirect(url_for("student.cart"))


@student_bp.route("/orders")
@login_required
def orders():
    orders = Order.query.filter_by(buyerID=current_user.userID).order_by(Order.orderDate.desc()).all()
    return render_template("student/orders.html", orders=orders, active_page="orders")

@student_bp.route('/student/my_items')
@login_required
def my_items():
    # Only allow students
    if current_user.role != 'student':
        flash("Unauthorized access", "danger")
        return redirect(url_for('student.dashboard'))

    # Fetch items where sellerID = current user
    items = Item.query.filter_by(sellerID=current_user.userID).all()
    return render_template('student/my_items.html', items=items)

@student_bp.route('/student/item/<int:item_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_item(item_id):
    # Fetch the item or 404
    item = Item.query.get_or_404(item_id)

    # Only allow the seller to edit their own items
    if item.sellerID != current_user.userID:
        flash("Unauthorized access", "danger")
        return redirect(url_for('student.my_items'))

    if request.method == 'POST':
        title = request.form.get('title')
        category = request.form.get('category')
        price = request.form.get('price')
        availability = request.form.get('availability')

        # Basic validation
        if not title or not price:
            flash("Title and price are required.", "warning")
            return redirect(url_for('student.edit_item', item_id=item_id))

        try:
            item.title = title
            item.category = category
            item.price = float(price)
            item.availability = int(availability)
            
            db.session.commit()
            flash(f"Item '{title}' updated successfully!", "success")
            return redirect(url_for('student.my_items'))

        except Exception as e:
            db.session.rollback()
            flash(f"Error updating item: {e}", "danger")

    # GET request - render form with current item details
    return render_template('student/edit_item.html', item=item)


@student_bp.route('/student/item/<int:item_id>/delete', methods=['POST'])
@login_required
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    if item.sellerID != current_user.userID:
        abort(403)
    db.session.delete(item)
    db.session.commit()
    flash("Item deleted successfully.", "success")
    return redirect(url_for('student.my_items'))

from sqlalchemy.orm import joinedload
from datetime import datetime

from datetime import datetime
from flask_login import current_user
from backend.models import db, Order, BillInvoice, OrderDetails

@student_bp.route('/student/checkout', methods=['POST'])
@login_required
def checkout():
    from sqlalchemy.orm import joinedload
    import traceback
    try:
        cart_items = ShoppingCart.query.options(joinedload(ShoppingCart.item)) \
            .filter_by(userID=current_user.userID).all()

        if not cart_items:
            flash("Your cart is empty.", "info")
            return redirect(url_for('student.cart'))

        # 1️⃣ Create new Order
        new_order = Order(
            buyerID=current_user.userID,
            status='Paid',
            orderDate=datetime.utcnow()
        )
        db.session.add(new_order)
        db.session.flush()  # Get orderID for invoice linkage

        # 2️⃣ Calculate total amount
        total_amount = 0
        for cart_item in cart_items:
            if not cart_item.item:
                continue

            # Create order details
            od = OrderDetails(
                orderID=new_order.orderID,
                itemID=cart_item.item.itemID,
                quantity=cart_item.quantity,
                price=cart_item.item.price
            )
            db.session.add(od)

            # Update stock
            cart_item.item.availability -= cart_item.quantity
            if cart_item.item.availability < 0:
                cart_item.item.availability = 0

            # Calculate total (price × quantity)
            total_amount += cart_item.item.price * cart_item.quantity

        # 3️⃣ Create BillInvoice
        new_invoice = BillInvoice(
            amount=total_amount,
            paymentDate=datetime.utcnow(),
            paymentMethod='Online',
            status='Paid',
            userID=current_user.userID,
            orderID=new_order.orderID  # ✅ ensure orderID is linked
        )
        db.session.add(new_invoice)

        # 4️⃣ Clear the cart
        for ci in cart_items:
            db.session.delete(ci)

        # 5️⃣ Commit all
        db.session.commit()

        flash("Payment successful! Your order and invoice have been generated.", "success")
        return redirect(url_for('student.orders'))

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        flash(f"Error during checkout: {e}", "danger")
        return redirect(url_for('student.cart'))
