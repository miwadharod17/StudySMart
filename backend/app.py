from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Item, Feedback, ForumPost, ForumComment, ForumLike
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)

# ---------------- Database Setup ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///studysmart.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ---------------- CORS Setup ----------------
# Allow all origins, methods, headers, and credentials
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ---------------- Upload Folder ----------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "static/images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

with app.app_context():
    db.create_all()

# ---------------- Helper: Register User ----------------
def register_user(name, email, password, role):
    if not name or not email or not password:
        return jsonify({"error": "Please provide name, email, and password"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    new_user = User(name=name, email=email,
                    password=generate_password_hash(password),
                    role=role)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"{role.capitalize()} registration successful"}), 201

# ---------------- Registration Routes ----------------
@app.route("/register/<role>", methods=["POST"])
def register(role):
    if role not in ["student", "vendor", "admin"]:
        return jsonify({"error": "Invalid role"}), 400
    data = request.get_json()
    return register_user(
        data.get("name"),
        data.get("email"),
        data.get("password"),
        role=role
    )

# ---------------- Login ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email, password = data.get("email"), data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "userID": user.userID,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })

# ---------------- Get Student Items ----------------
@app.route("/items/student/<int:user_id>", methods=["GET"])
def get_student_items(user_id):
    items = Item.query.filter_by(sellerID=user_id).all()
    return jsonify([{
        "itemID": item.itemID,
        "title": item.title,
        "description": item.description,
        "price": item.price,
        "availability": item.availability,
        "image": item.image,
        "category": item.category,
        "is_approved": item.is_approved,
        "rating": item.rating,
        "reviews": item.reviews
    } for item in items])

# ---------------- Add New Item (Student/Vendor) ----------------
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from models import db, User, Item
import os

UPLOAD_FOLDER = os.path.join(os.getcwd(), "static/images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/items/student/<int:user_id>", methods=["POST", "OPTIONS"])
def add_student_item(user_id):
    # Debug: check if route is hit
    print("✅ POST request received for user:", user_id)
    print("Form data:", request.form)
    print("Files:", request.files)

    if request.method == "OPTIONS":
        # Respond to preflight
        return jsonify({"status": "ok"}), 200

    data = request.form
    image = request.files.get("image")
    image_path = None

    if image:
        image_filename = f"{user_id}_{image.filename}"
        image.save(os.path.join(UPLOAD_FOLDER, image_filename))
        image_path = f"/static/images/{image_filename}"

    user = User.query.get_or_404(user_id)
    new_item = Item(
        title=data.get("title"),
        description=data.get("description"),
        price=float(data.get("price")),
        availability=int(data.get("availability")),
        sellerID=user_id,
        image=image_path,
        category=data.get("category"),
        is_approved=False
    )

    db.session.add(new_item)
    db.session.commit()
    print(f"✅ Item '{new_item.title}' added for user {user.name}")

    return jsonify({"message": f"Item '{new_item.title}' added and pending admin approval"}), 201


# ---------------- Admin: Approve Item ----------------
@app.route("/admin/approve/item/<int:item_id>", methods=["PATCH"])
def approve_item(item_id):
    data = request.get_json()
    admin_id = data.get("adminID")
    admin = User.query.get_or_404(admin_id)
    if not admin.can_approve():
        return jsonify({"error": "Permission denied"}), 403

    item = Item.query.get_or_404(item_id)
    item.is_approved = True
    db.session.commit()
    return jsonify({"message": f"Item '{item.title}' approved by {admin.name}"}), 200

# ---------------- Admin: Delete Item ----------------
@app.route("/admin/delete/item/<int:item_id>", methods=["DELETE"])
def delete_item_admin(item_id):
    data = request.get_json()
    admin_id = data.get("adminID")
    admin = User.query.get_or_404(admin_id)
    if not admin.can_approve():
        return jsonify({"error": "Permission denied"}), 403

    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": f"Item '{item.title}' deleted by admin {admin.name}"}), 200

# ---------------- Get All Approved Items ----------------
@app.route("/items", methods=["GET"])
def get_all_items():
    items = Item.query.filter_by(is_approved=True).all()
    return jsonify([{
        "itemID": item.itemID,
        "title": item.title,
        "description": item.description,
        "price": item.price,
        "availability": item.availability,
        "image": item.image,
        "category": item.category,
        "rating": item.rating,
        "reviews": item.reviews
    } for item in items])

# ---------------- Feedback ----------------
@app.route("/feedback", methods=["POST"])
def give_feedback():
    data = request.get_json()
    feedback = Feedback(
        rating=data["rating"],
        comment=data.get("comment", ""),
        userID=data["userID"],
        itemID=data["itemID"]
    )
    msg = feedback.giveFeedback()
    return jsonify({"message": msg})

# ---------------- Forum: Create Post ----------------
@app.route("/forum/post", methods=["POST"])
def create_post():
    data = request.get_json()
    user = User.query.get_or_404(data["userID"])
    if not user.can_post_forum():
        return jsonify({"error": "Permission denied"}), 403

    post = ForumPost(title=data["title"], content=data["content"],
                     userID=user.userID, is_approved=False)
    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post created. Pending admin approval."}), 201

# ---------------- Admin: Approve Forum Post ----------------
@app.route("/admin/approve/post/<int:post_id>", methods=["PATCH"])
def approve_post(post_id):
    data = request.get_json()
    admin = User.query.get_or_404(data["adminID"])
    if not admin.can_approve():
        return jsonify({"error": "Permission denied"}), 403

    post = ForumPost.query.get_or_404(post_id)
    post.is_approved = True
    db.session.commit()
    return jsonify({"message": f"Forum post '{post.title}' approved by {admin.name}"}), 200

# ---------------- Forum: Get Approved Posts ----------------
@app.route("/forum/posts", methods=["GET"])
def get_forum_posts():
    posts = ForumPost.query.filter_by(is_approved=True).order_by(ForumPost.timestamp.desc()).all()
    return jsonify([{
        "postID": p.postID,
        "title": p.title,
        "content": p.content,
        "user": p.user.name,
        "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M"),
        "likes": len(p.likes)
    } for p in posts])

# ---------------- Forum: Add Comment ----------------
@app.route("/forum/comment", methods=["POST"])
def add_comment():
    data = request.get_json()
    comment = ForumComment(content=data["content"],
                           postID=data["postID"],
                           userID=data["userID"])
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Comment added"}), 201

# ---------------- Forum: Like/Unlike Post ----------------
@app.route("/forum/like", methods=["POST"])
def toggle_like():
    data = request.get_json()
    user = User.query.get_or_404(data["userID"])
    post = ForumPost.query.get_or_404(data["postID"])

    existing_like = ForumLike.query.filter_by(userID=user.userID, postID=post.postID).first()
    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"message": f"{user.name} unliked '{post.title}'"}), 200
    else:
        like = ForumLike(userID=user.userID, postID=post.postID)
        db.session.add(like)
        db.session.commit()
        return jsonify({"message": f"{user.name} liked '{post.title}'"}), 201

# ---------------- Run Server ----------------
if __name__ == "__main__":
    app.run(debug=True)
