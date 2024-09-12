from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

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

# Appointment model
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

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 400

    new_user = User(username=username, email=email, role=role)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login route
@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'username': user.username
        }), 200
    else:
        return jsonify({
            'error': 'Invalid credentials'
        }), 401

# Show a specific appointment by ID
@app.route("/ShowAppointment/<int:appointment_id>", methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=current_user_id).first()

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    return jsonify({
        'id': appointment.id,
        'date': appointment.date,
        'time_from': appointment.time_from,
        'time_to': appointment.time_to,
        'specialization': appointment.specialization,
        'comments': appointment.comments
    }), 200

# Show all appointments
@app.route("/ShowAppointment", methods=['GET'])
@jwt_required()
def show_appointment():
    current_user_id = get_jwt_identity()
    appointments = Appointment.query.filter_by(user_id=current_user_id).all()

    appointments_list = [{
        'id': appointment.id,
        'date': appointment.date,
        'time_from': appointment.time_from,
        'time_to': appointment.time_to,
        'specialization': appointment.specialization,
        'comments': appointment.comments
    } for appointment in appointments]

    return jsonify({'appointments': appointments_list}), 200

# Add a new appointment
@app.route("/AddAppointment", methods=['POST'])
@jwt_required()
def add_appointment():
    data = request.get_json()
    user_id = get_jwt_identity()

    date_str = data.get('date')
    time_from_str = data.get('time_from')
    time_to_str = data.get('time_to')

    try:
        selected_time_from = datetime.strptime(f"{date_str} {time_from_str}", "%Y-%m-%d %H:%M")
        selected_time_to = datetime.strptime(f"{date_str} {time_to_str}", "%Y-%m-%d %H:%M")
        current_time = datetime.now()
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400
    
    if selected_time_from < current_time:
        return jsonify({'error': 'Cannot create an appointment in the past'}), 400
    
    if selected_time_to <= selected_time_from:
        return jsonify({'error': 'End time must be after the start time'}), 400

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

@app.route("/UpdateAppointment/<int:appointment_id>", methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    data = request.get_json()
    user_id = get_jwt_identity()  # Get the logged-in user's ID

    # Fetch the appointment to be updated
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    # Validate and update date and time if provided
    date_str = data.get('date', appointment.date)
    time_from_str = data.get('time_from', appointment.time_from)
    time_to_str = data.get('time_to', appointment.time_to)

    try:
        # Check for the correct format of date and time
        selected_time_from = datetime.strptime(f"{date_str} {time_from_str}", "%Y-%m-%d %H:%M")
        selected_time_to = datetime.strptime(f"{date_str} {time_to_str}", "%Y-%m-%d %H:%M")
        current_time = datetime.now()
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400

    if selected_time_from < current_time:
        return jsonify({'error': 'Cannot create or update an appointment in the past'}), 400

    if selected_time_to <= selected_time_from:
        return jsonify({'error': 'End time must be after the start time'}), 400

    # Update the fields
    appointment.date = date_str
    appointment.time_from = time_from_str
    appointment.time_to = time_to_str
    appointment.specialization = data.get('specialization', appointment.specialization)
    appointment.comments = data.get('comments', appointment.comments)

    try:
        db.session.commit()
        return jsonify({'message': 'Appointment updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update appointment: {str(e)}'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
