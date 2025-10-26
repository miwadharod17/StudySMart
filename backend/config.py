import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'studysmart.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = '123abc'  # use a strong random string
    UPLOAD_FOLDER = os.path.join("static", "uploads", "items")