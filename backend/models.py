from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

# ===================== USER =====================
class User(db.Model, UserMixin):
    userID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='student')  # student, vendor, admin

    # Relationships
    items_sold = db.relationship('Item', back_populates='seller', lazy=True)
    purchased_orders = db.relationship('Order', back_populates='buyer', lazy=True)
    cart_items = db.relationship('ShoppingCart', backref='user', lazy=True)
    feedbacks = db.relationship('Feedback', backref='user', lazy=True)
    forum_posts = db.relationship('ForumPost', backref='user', lazy=True)
    forum_comments = db.relationship('ForumComment', backref='user', lazy=True)
    forum_likes = db.relationship('ForumLike', backref='user', lazy=True)
    bills = db.relationship('BillInvoice', backref='user', lazy=True)

    # Password methods
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def get_id(self):
        return str(self.userID)

    # Role-based actions
    def can_sell(self):
        return self.role in ['student', 'vendor']

    def can_purchase(self):
        return self.role == 'student'

    def can_post_forum(self):
        return self.role == 'student'

    def can_like_forum(self):
        return self.role == 'student'

    def can_provide_voucher(self):
        return self.role == 'vendor'

    def can_approve(self):
        return self.role == 'admin'

    # Checkout method
    def checkout_cart(self, voucher=None, payment_method='Cash'):
        if not self.cart_items:
            return "Cart is empty."
        if not self.can_purchase():
            return "Permission denied."
        order = Order(buyerID=self.userID, voucherID=voucher.voucherID if voucher else None)
        try:
            result_message = order.placeOrder(cart_items=self.cart_items, voucher=voucher, payment_method=payment_method)
            return result_message
        except Exception as e:
            db.session.rollback()
            return f"Error during checkout: {e}"

# ===================== ITEM =====================
class Item(db.Model):
    itemID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Integer, default=0)
    image = db.Column(db.String(200))
    rating = db.Column(db.Float, default=0)
    reviews = db.Column(db.Integer, default=0)
    is_approved = db.Column(db.Boolean, default=True)  # Admin approval

    # Seller
    sellerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    seller = db.relationship('User', back_populates='items_sold')

    feedbacks = db.relationship('Feedback', backref='item', lazy=True)
    orders = db.relationship('OrderDetails', backref='item', lazy=True)
    cart_items = db.relationship('ShoppingCart', backref='item', lazy=True)

    # Methods
    def sellItem(self, user):
        if not user.can_sell():
            return "Permission denied."
        self.is_approved = True  # Needs admin approval
        try:
            db.session.add(self)
            db.session.commit()
            return f"{self.title} listed for sale. Pending admin approval."
        except Exception as e:
            db.session.rollback()
            return f"Error listing item: {e}"

    def update_rating(self):
        if not self.feedbacks:
            self.rating = 0
            self.reviews = 0
        else:
            self.reviews = len(self.feedbacks)
            self.rating = sum(f.rating for f in self.feedbacks) / self.reviews
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()

# ===================== VOUCHER =====================
class Voucher(db.Model):
    voucherID = db.Column(db.Integer, primary_key=True)
    discountPercent = db.Column(db.Float)
    expiryDate = db.Column(db.DateTime)

    orders = db.relationship('Order', backref='voucher', lazy=True)

    def isValid(self):
        return datetime.utcnow() <= self.expiryDate

# ===================== ORDER =====================
class Order(db.Model):
    orderID = db.Column(db.Integer, primary_key=True)
    orderDate = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')

    buyerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    buyer = db.relationship('User', back_populates='purchased_orders')

    voucherID = db.Column(db.Integer, db.ForeignKey('voucher.voucherID'), nullable=True)
    bill = db.relationship('BillInvoice', back_populates='order', uselist=False)
    order_details = db.relationship('OrderDetails', backref='order', lazy=True)

    def placeOrder(self, cart_items, voucher=None, payment_method='Cash'):
        total_amount = 0
        original_stocks = {}

        try:
            # Check stock
            for cart_item in cart_items:
                if cart_item.quantity > cart_item.item.availability:
                    return f"Insufficient stock for {cart_item.item.title}."
                original_stocks[cart_item.item.itemID] = cart_item.item.availability

            db.session.add(self)
            db.session.flush()  # get orderID

            # Add order details
            for cart_item in cart_items:
                od = OrderDetails(
                    orderID=self.orderID,
                    itemID=cart_item.itemID,
                    quantity=cart_item.quantity,
                    price=cart_item.item.price * cart_item.quantity
                )
                db.session.add(od)
                total_amount += od.price
                cart_item.item.availability -= cart_item.quantity
                db.session.delete(cart_item)

            if voucher and voucher.isValid():
                discount = (voucher.discountPercent / 100) * total_amount
                total_amount -= discount

            # Create bill
            bill = BillInvoice(
                userID=self.buyerID,
                orderID=self.orderID,
                amount=total_amount,
                paymentMethod=payment_method
            )
            db.session.add(bill)
            self.status = "Placed"
            db.session.commit()

            return f"Order {self.orderID} placed. Bill {bill.billID} generated for ₹{total_amount:.2f}"

        except Exception as e:
            for item_id, stock in original_stocks.items():
                item = Item.query.get(item_id)
                if item:
                    item.availability = stock
            db.session.rollback()
            return f"Error during order placement: {e}"

# ===================== ORDER DETAILS =====================
class OrderDetails(db.Model):
    orderDetailID = db.Column(db.Integer, primary_key=True)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)

# ===================== SHOPPING CART =====================
class ShoppingCart(db.Model):
    cartID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

# ===================== BILL INVOICE =====================
class BillInvoice(db.Model):
    billID = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    paymentDate = db.Column(db.DateTime, default=datetime.utcnow)
    paymentMethod = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Pending')
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)
    order = db.relationship('Order', back_populates='bill')

# ===================== FEEDBACK =====================
class Feedback(db.Model):
    feedbackID = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, db.CheckConstraint('rating BETWEEN 1 AND 5'))
    comment = db.Column(db.String(500))
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)

    def giveFeedback(self):
        # Only allow if user purchased item
        purchase = OrderDetails.query.join(Order).filter(
            Order.buyerID == self.userID,
            OrderDetails.itemID == self.itemID
        ).first()
        if not purchase:
            return "Cannot give feedback for items not purchased."
        try:
            db.session.add(self)
            db.session.commit()
            self.item.update_rating()
            return f"Feedback added for item {self.itemID}"
        except Exception as e:
            db.session.rollback()
            return f"Error giving feedback: {e}"

# ===================== FORUM POST =====================
class ForumPost(db.Model):
    postID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.String(1000))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    is_approved = db.Column(db.Boolean, default=True)

    comments = db.relationship('ForumComment', backref='forum_post', lazy=True)
    likes = db.relationship('ForumLike', backref='forum_post', lazy=True)

# ===================== FORUM COMMENT =====================
class ForumComment(db.Model):
    commentID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    postID = db.Column(db.Integer, db.ForeignKey('forum_post.postID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

# ===================== FORUM LIKE =====================
class ForumLike(db.Model):
    likeID = db.Column(db.Integer, primary_key=True)
    postID = db.Column(db.Integer, db.ForeignKey('forum_post.postID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
