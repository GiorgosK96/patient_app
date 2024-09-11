from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

# Configuration for database and JWT
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appointments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a strong secret key

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), nullable=False, default='patient')  # Default role as 'patient'

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f"<User('{self.username}', '{self.email}', '{self.role}')>"


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time_from = db.Column(db.String(10), nullable=False)
    time_to = db.Column(db.String(10), nullable=False)
    specialization = db.Column(db.String(50), nullable=False)
    comments = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Appointment for {self.specialization} on {self.date}>"


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

    # Save to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


# Login route
@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()

    # Check if the user exists
    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        # If user exists and password is correct, generate a JWT token
        token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'username': user.username  # Add the username here
        }), 200
    else:
        # If the email or password is incorrect
        return jsonify({
            'error': 'Invalid credentials'
        }), 401


@app.route("/manageAppointment", methods=['GET'])
@jwt_required()  # Protect this route
def manage_appointment():
    current_user_id = get_jwt_identity()  # Get the identity of the logged-in user from the token
    # Fetch or process user-specific appointments
    return jsonify({'message': 'Here are your appointments', 'user_id': current_user_id}), 200


@app.route("/AddAppointment", methods=['POST'])
@jwt_required()
def add_appointment():
    data = request.get_json()
    user_id = get_jwt_identity()  # Get the ID of the logged-in user

    if not data.get('date') or not data.get('time_from') or not data.get('time_to') or not data.get('specialization'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_appointment = Appointment(
        user_id=user_id,
        date=data['date'],
        time_from=data['time_from'],
        time_to=data['time_to'],
        specialization=data['specialization'],
        comments=data.get('comments', '')
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({'message': 'Appointment created successfully'}), 201


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the database and tables if they don't exist
    app.run(debug=True)
