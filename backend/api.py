from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appointments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), nullable=False)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f"<User('{self.username}', '{self.email}', '{self.role}')>"

# Register route
@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient')  # Default role to 'patient'

    # Check if email is already registered
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Check if username is already taken
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 400

    # Create a new user
    new_user = User(username=username, email=email, role=role)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
