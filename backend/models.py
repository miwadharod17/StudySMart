
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

# user
class User(db.Model, UserMixin):
    userID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='student')

    items_sold = db.relationship('Item', back_populates='seller', lazy=True)
    purchased_orders = db.relationship('Order', back_populates='buyer', lazy=True)
    cart_items = db.relationship('ShoppingCart', backref='user', lazy=True)
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

    def login(self):
        print(f"{self.name} logged in.")

    def logout(self):
        print(f"{self.name} logged out.")

    def notify(self, message):
        print(f"Notification for {self.name}: {message}")

    def receiveBill(self, bill):
        print(f"{self.name} received bill ID: {bill.billID}")

    def checkout_cart(self, voucher=None, payment_method='Cash'):
        if not self.cart_items:
            return "Cart is empty."

        order = Order(userID=self.userID, voucherID=voucher.voucherID if voucher else None)
        try:
            result_message = order.placeOrder(cart_items=self.cart_items, voucher=voucher, payment_method=payment_method)
            return result_message
        except Exception as e:
            db.session.rollback()
            return f"Error during checkout: {e}"


# Item
class Item(db.Model):
    itemID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Integer, default=0)
    sellerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=True)
    
    seller = db.relationship('User', back_populates='items_sold')
    feedbacks = db.relationship('Feedback', backref='item', lazy=True)
    orders = db.relationship('OrderDetails', backref='item', lazy=True)
    
    def uploadImage(self):
        print(f"Image uploaded for item: {self.title}")

    def buyItem(self):
        return f"{self.title} purchased successfully."

    def sellItem(self):
        return f"{self.title} listed for sale."

    def updateQuantity(self, new_qty):
        self.availability = new_qty
        try:
            db.session.commit()
            print(f"Quantity updated for {self.title} to {new_qty}")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating quantity: {e}")

# Voucher
class Voucher(db.Model):
    voucherID = db.Column(db.Integer, primary_key=True)
    discountPercent = db.Column(db.Float)
    expiryDate = db.Column(db.DateTime)

    orders = db.relationship('Order', backref='voucher', lazy=True)

    def applyVoucher(self, order):
        total = sum(od.price for od in order.order_details)
        discount = (self.discountPercent / 100) * total
        print(f"Voucher applied. Discount: ₹{discount:.2f}")
        return discount

    def createVoucher(self, discountPercent, expiryDate):
        self.discountPercent = discountPercent
        self.expiryDate = expiryDate
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Voucher {self.voucherID} created with {discountPercent}% discount")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating voucher: {e}")
    
    def isValid(self):
        return datetime.utcnow() <= self.expiryDate


# order
class Order(db.Model):
    orderID = db.Column(db.Integer, primary_key=True)
    orderDate = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')
    buyerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    voucherID = db.Column(db.Integer, db.ForeignKey('voucher.voucherID'), nullable=True)
    
    buyer = db.relationship('User', back_populates='purchased_orders')
    bill = db.relationship('BillInvoice', back_populates='order', uselist=False)
    order_details = db.relationship('OrderDetails', backref='order', lazy=True)

    def placeOrder(self, cart_items, voucher=None, payment_method='Cash'):
        if not cart_items:
            return "Cart is empty."

        total_amount = 0
        original_stocks = {}

        try:
            # 1. Check stock
            for cart_item in cart_items:
                if cart_item.quantity > cart_item.item.availability:
                    return f"Insufficient stock for {cart_item.item.title} (Available: {cart_item.item.availability})"
                # Save original stock for potential rollback
                original_stocks[cart_item.item.itemID] = cart_item.item.availability

            # 2. Add Order to DB
            db.session.add(self)
            db.session.flush()  # Get orderID without committing

            # 3. Add OrderDetails and update stock
            for cart_item in cart_items:
                od = OrderDetails(
                    orderID=self.orderID,
                    itemID=cart_item.itemID,
                    quantity=cart_item.quantity,
                    price=cart_item.item.price * cart_item.quantity
                )
                db.session.add(od)
                total_amount += od.price

                # Update item stock
                cart_item.item.availability -= cart_item.quantity

                # Remove from cart
                db.session.delete(cart_item)

            # 4. Apply voucher if valid
            if voucher and voucher.isValid():
                discount = voucher.applyVoucher(self)
                total_amount -= discount

            # 5. Generate bill
            bill = BillInvoice(
                userID=self.userID,
                amount=total_amount,
                paymentMethod=payment_method
            )
            db.session.add(bill)
            db.session.flush()  # Get billID before commit

            # 6. Commit everything atomically
            self.status = "Placed"
            db.session.commit()

            return f"Order {self.orderID} placed. Bill {bill.billID} generated for ₹{total_amount:.2f}"

        except Exception as e:
            # Rollback stock changes in memory (DB rollback will undo anyway)
            for item_id, stock in original_stocks.items():
                item = Item.query.get(item_id)
                if item:
                    item.availability = stock
            db.session.rollback()
            return f"Error during order placement: {e}"

    def cancelOrder(self):
        if self.status != "Placed":
            print(f"Order {self.orderID} cannot be cancelled. Status: {self.status}")
            return

        try:
            # 1. Restock items
            for od in self.order_details:
                od.item.availability += od.quantity

            # 2. Update order status
            self.status = "Cancelled"
            db.session.commit()
            print(f"Order {self.orderID} cancelled and stock restored.")

        except Exception as e:
            db.session.rollback()
            print(f"Error cancelling order: {e}")
            
    def viewOrders(self):
        return f"Order ID: {self.orderID}, Status: {self.status}"

# order details
class OrderDetails(db.Model):
    orderDetailID = db.Column(db.Integer, primary_key=True)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)

    def createOrder(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Order detail created for item ID {self.itemID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating order detail: {e}")

    def storeOrder(self):
        print(f"Order detail stored for order ID {self.orderID}")

# shopping cart
class ShoppingCart(db.Model):
    cartID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    
    item = db.relationship('Item', backref='cart_items', lazy=True)

    def __repr__(self):
        return f"<ShoppingCart(cartID={self.cartID}, userID={self.userID}, itemID={self.itemID}, quantity={self.quantity})>"

    @staticmethod
    def addToCart(user, item, qty):
        cart_item = ShoppingCart.query.filter_by(userID=user.userID, itemID=item.itemID).first()
        if cart_item:
            cart_item.quantity += qty
        else:
            cart_item = ShoppingCart(userID=user.userID, itemID=item.itemID, quantity=qty)
            db.session.add(cart_item)
        try:
            db.session.commit()
            print(f"Added {qty} of {item.title} to {user.name}'s cart")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding to cart: {e}")
    def viewCart(self):
        return f"{self.item.title} × {self.quantity} (₹{self.item.price * self.quantity:.2f})"




    def removeFromCart(self, item, qty=1):
        try:
            if self.itemID == item.itemID:
                if self.quantity > qty:
                    self.quantity -= qty
                    db.session.commit()
                    print(f"Reduced {item.title} by {qty} in cart ID {self.cartID}")
                else:
                    db.session.delete(self)
                    db.session.commit()
                    print(f"Removed {item.title} from cart ID {self.cartID}")
            else:
                print(f"Item {item.title} not found in this cart.")
        except Exception as e:
            db.session.rollback()
            print(f"Error removing item: {e}")

    

# Bill invoice
class BillInvoice(db.Model):
    billID = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    paymentDate = db.Column(db.DateTime, default=datetime.utcnow)
    paymentMethod = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Pending')
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)

    order = db.relationship('Order', back_populates='bill')
    
    def generateBillInvoice(self):
        self.status = "Generated"
        try:
            db.session.commit()
            print(f"Bill invoice {self.billID} generated for ₹{self.amount}")
        except Exception as e:
            db.session.rollback()
            print(f"Error generating bill invoice: {e}")

    def showInvoice(self):
        return f"Bill ID: {self.billID}, Amount: ₹{self.amount}, Status: {self.status}"

# Feedback
class Feedback(db.Model):
    feedbackID = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, db.CheckConstraint('rating BETWEEN 1 AND 5'))
    comment = db.Column(db.String(500))
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)

    def giveFeedback(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Feedback {self.feedbackID} given by user {self.userID} for item {self.itemID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error giving feedback: {e}")

# post
class ForumPost(db.Model):
    postID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.String(1000))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    comments = db.relationship('ForumComment', backref='forum_post', lazy=True)

    def createPost(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Post {self.postID} created by user {self.userID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating post: {e}")

    def approvePost(self):
        print(f"Post {self.postID} approved by moderator")

    def deletePost(self):
        try:
            db.session.delete(self)
            db.session.commit()
            print(f"Post {self.postID} deleted")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting post: {e}")

# comment
class ForumComment(db.Model):
    commentID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    postID = db.Column(db.Integer, db.ForeignKey('forum_post.postID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    def addComment(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Comment {self.commentID} added on post {self.postID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding comment: {e}")

    def deleteComment(self):
        try:
            db.session.delete(self)
            db.session.commit()
            print(f"Comment {self.commentID} deleted from post {self.postID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting comment: {e}")
"""

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
    role = db.Column(db.String(50), default='student')

    # Seller relationship — items sold by this user
    items_sold = db.relationship('Item', back_populates='seller', lazy=True, cascade='all, delete')

    # Buyer relationship — orders placed by this user
    purchased_orders = db.relationship('Order', back_populates='buyer', lazy=True, cascade='all, delete')

    # Other relationships
    cart_items = db.relationship('ShoppingCart', backref='user', lazy=True, cascade='all, delete')
    feedbacks = db.relationship('Feedback', backref='user', lazy=True, cascade='all, delete')
    forum_posts = db.relationship('ForumPost', backref='user', lazy=True, cascade='all, delete')
    forum_comments = db.relationship('ForumComment', backref='user', lazy=True, cascade='all, delete')
    bills = db.relationship('BillInvoice', backref='user', lazy=True, cascade='all, delete')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def get_id(self):
        return str(self.userID)

    def login(self):
        print(f"{self.name} logged in.")

    def logout(self):
        print(f"{self.name} logged out.")

    def notify(self, message):
        print(f"Notification for {self.name}: {message}")

    def receiveBill(self, bill):
        print(f"{self.name} received bill ID: {bill.billID}")

    def checkout_cart(self, voucher=None, payment_method='Cash'):
        if not self.cart_items:
            return "Cart is empty."

        order = Order(userID=self.userID, voucherID=voucher.voucherID if voucher else None)
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
    price = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Integer, default=0)

    # Foreign key to seller (User)
    sellerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    seller = db.relationship('User', back_populates='items_sold')

    feedbacks = db.relationship('Feedback', backref='item', lazy=True, cascade='all, delete')
    orders = db.relationship('OrderDetails', backref='item', lazy=True, cascade='all, delete')

    def uploadImage(self):
        print(f"Image uploaded for item: {self.title}")

    def buyItem(self):
        return f"{self.title} purchased successfully."

    def sellItem(self):
        return f"{self.title} listed for sale."

    def updateQuantity(self, new_qty):
        self.availability = new_qty
        try:
            db.session.commit()
            print(f"Quantity updated for {self.title} to {new_qty}")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating quantity: {e}")

# ===================== VOUCHER (Moved Up) =====================

class Voucher(db.Model):
    voucherID = db.Column(db.Integer, primary_key=True)
    discountPercent = db.Column(db.Float)
    expiryDate = db.Column(db.DateTime)

    orders = db.relationship('Order', backref='voucher', lazy=True, cascade='all, delete')

    def applyVoucher(self, order):
        total = sum(od.price for od in order.order_details)
        discount = (self.discountPercent / 100) * total
        print(f"Voucher applied. Discount: ₹{discount:.2f}")
        return discount

    def createVoucher(self, discountPercent, expiryDate):
        self.discountPercent = discountPercent
        self.expiryDate = expiryDate
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Voucher {self.voucherID} created with {discountPercent}% discount")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating voucher: {e}")
    
    def isValid(self):
        return datetime.utcnow() <= self.expiryDate

# ===================== ORDER =====================

class Order(db.Model):
    orderID = db.Column(db.Integer, primary_key=True)
    orderDate = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')

    # Foreign key to buyer (User)
    buyerID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    buyer = db.relationship('User', back_populates='purchased_orders')

    voucherID = db.Column(db.Integer, db.ForeignKey('voucher.voucherID'), nullable=True)
    bill = db.relationship('BillInvoice', back_populates='order', uselist=False, cascade='all, delete')

    order_details = db.relationship('OrderDetails', backref='order', lazy=True, cascade='all, delete')

    def placeOrder(self, cart_items, voucher=None, payment_method='Cash'):
        if not cart_items:
            return "Cart is empty."

        total_amount = 0
        original_stocks = {}

        try:
            for cart_item in cart_items:
                if cart_item.quantity > cart_item.item.availability:
                    return f"Insufficient stock for {cart_item.item.title} (Available: {cart_item.item.availability})"
                original_stocks[cart_item.item.itemID] = cart_item.item.availability

            db.session.add(self)
            db.session.flush()

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
                discount = voucher.applyVoucher(self)
                total_amount -= discount

            bill = BillInvoice(
                userID=self.userID,
                amount=total_amount,
                paymentMethod=payment_method
            )
            db.session.add(bill)
            db.session.flush()

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

    def cancelOrder(self):
        if self.status != "Placed":
            print(f"Order {self.orderID} cannot be cancelled. Status: {self.status}")
            return

        try:
            for od in self.order_details:
                od.item.availability += od.quantity

            self.status = "Cancelled"
            db.session.commit()
            print(f"Order {self.orderID} cancelled and stock restored.")

        except Exception as e:
            db.session.rollback()
            print(f"Error cancelling order: {e}")
            
    def viewOrders(self):
        return f"Order ID: {self.orderID}, Status: {self.status}"

# ===================== ORDER DETAILS =====================

class OrderDetails(db.Model):
    orderDetailID = db.Column(db.Integer, primary_key=True)
    orderID = db.Column(db.Integer, db.ForeignKey('order.orderID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)

    def createOrder(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Order detail created for item ID {self.itemID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating order detail: {e}")

    def storeOrder(self):
        print(f"Order detail stored for order ID {self.orderID}")

# ===================== SHOPPING CART =====================

class ShoppingCart(db.Model):
    cartID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    item = db.relationship('Item', backref='cart_items', lazy=True, cascade='all, delete')

    def __repr__(self):
        return f"<ShoppingCart(cartID={self.cartID}, userID={self.userID}, itemID={self.itemID}, quantity={self.quantity})>"

    @staticmethod
    def addToCart(user, item, qty):
        cart_item = ShoppingCart.query.filter_by(userID=user.userID, itemID=item.itemID).first()
        if cart_item:
            cart_item.quantity += qty
        else:
            cart_item = ShoppingCart(userID=user.userID, itemID=item.itemID, quantity=qty)
            db.session.add(cart_item)
        try:
            db.session.commit()
            print(f"Added {qty} of {item.title} to {user.name}'s cart")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding to cart: {e}")

    def viewCart(self):
        return f"{self.item.title} × {self.quantity} (₹{self.item.price * self.quantity:.2f})"

    def removeFromCart(self, item, qty=1):
        try:
            if self.itemID == item.itemID:
                if self.quantity > qty:
                    self.quantity -= qty
                    db.session.commit()
                    print(f"Reduced {item.title} by {qty} in cart ID {self.cartID}")
                else:
                    db.session.delete(self)
                    db.session.commit()
                    print(f"Removed {item.title} from cart ID {self.cartID}")
            else:
                print(f"Item {item.title} not found in this cart.")
        except Exception as e:
            db.session.rollback()
            print(f"Error removing item: {e}")

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

    def generateBillInvoice(self):
        self.status = "Generated"
        try:
            db.session.commit()
            print(f"Bill invoice {self.billID} generated for ₹{self.amount}")
        except Exception as e:
            db.session.rollback()
            print(f"Error generating bill invoice: {e}")

    def showInvoice(self):
        return f"Bill ID: {self.billID}, Amount: ₹{self.amount}, Status: {self.status}"

# ===================== FEEDBACK =====================

class Feedback(db.Model):
    feedbackID = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, db.CheckConstraint('rating BETWEEN 1 AND 5'))
    comment = db.Column(db.String(500))
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)
    itemID = db.Column(db.Integer, db.ForeignKey('item.itemID'), nullable=False)

    def giveFeedback(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Feedback {self.feedbackID} given by user {self.userID} for item {self.itemID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error giving feedback: {e}")

# ===================== FORUM POST =====================

class ForumPost(db.Model):
    postID = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.String(1000))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    comments = db.relationship('ForumComment', backref='forum_post', lazy=True, cascade='all, delete')

    def createPost(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Post {self.postID} created by user {self.userID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating post: {e}")

    def approvePost(self):
        print(f"Post {self.postID} approved by moderator")

    def deletePost(self):
        try:
            db.session.delete(self)
            db.session.commit()
            print(f"Post {self.postID} deleted")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting post: {e}")

# ===================== FORUM COMMENT =====================

class ForumComment(db.Model):
    commentID = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    postID = db.Column(db.Integer, db.ForeignKey('forum_post.postID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('user.userID'), nullable=False)

    def addComment(self):
        try:
            db.session.add(self)
            db.session.commit()
            print(f"Comment {self.commentID} added on post {self.postID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding comment: {e}")

    def deleteComment(self):
        try:
            db.session.delete(self)
            db.session.commit()
            print(f"Comment {self.commentID} deleted from post {self.postID}")
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting comment: {e}")

"""