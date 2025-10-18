from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    userID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='student')

    orders = db.relationship('Order', backref='user', lazy=True)
    shopping_cart = db.relationship('ShoppingCart', backref='user', uselist=False)
    feedbacks = db.relationship('Feedback', backref='user', lazy=True)
    forum_posts = db.relationship('ForumPost', backref='user', lazy=True)
    forum_comments = db.relationship('ForumComment', backref='user', lazy=True)
    bills = db.relationship('BillInvoice', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def get_id(self):
        return str(self.userID) 

class Item(db.Model):
    itemID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Integer, default=0)

    feedbacks = db.relationship('Feedback', backref='item', lazy=True)
    orders = db.relationship('OrderDetails', backref='item', lazy=True)

class Order(db.Model):
    orderID = db.Column(db.Integer, primary_key=True)
    orderDate = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    order_details = db.relationship('OrderDetails', backref='order', lazy=True)
    voucherID = db.Column(db.Integer, db.ForeignKey('voucher.voucherID'))

class OrderDetails(db.Model):
    orderDetailID = db.Column(db.Integer, primary_key=True)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)
    
class ShoppingCart(db.Model):
    cartID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    quantity = db.Column(db.Integer, default=0)

class Voucher(db.Model):
    voucherID = db.Column(db.Integer, primary_key=True)
    discountPercent = db.Column(db.Float)
    expiryDate = db.Column(db.DateTime)

    orders = db.relationship('Order', backref='voucher', lazy=True)

class BillInvoice(db.Model):
    billID = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    paymentDate = db.Column(db.DateTime, default=datetime.utcnow)
    paymentMethod = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Pending')
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

class Feedback(db.Model):
    feedbackID = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer)
    comment = db.Column(db.String(500))
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)

class ForumPost(db.Model):
    postID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.String(1000))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    comments = db.relationship('ForumComment', backref='forum_post', lazy=True)

class ForumComment(db.Model):
    commentID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    postID = db.Column(db.Integer, db.ForeignKey('forum_post.postID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)


