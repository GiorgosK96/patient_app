from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appointments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# Patient model
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f"<Patient('{self.full_name}', '{self.username}', '{self.email}')>"


# Doctor model
class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    specialization = db.Column(db.String(80), nullable=False)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f"<Doctor('{self.full_name}', '{self.username}', '{self.specialization}')>"


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)  # New field to store doctor ID
    date = db.Column(db.String(50), nullable=False)
    time_from = db.Column(db.String(10), nullable=False)
    time_to = db.Column(db.String(10), nullable=False)
    comments = db.Column(db.Text, nullable=True)

    doctor = db.relationship('Doctor', backref='appointments')  # To easily access doctor details

    def __repr__(self):
        return f"<Appointment with Doctor {self.doctor.full_name} on {self.date}>"


# Register route
@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('full_name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # Either 'patient' or 'doctor'
    specialization = data.get('specialization')

    if role == 'patient':
        # Register as a patient
        if Patient.query.filter_by(email=email).first() or Patient.query.filter_by(username=username).first():
            return jsonify({'error': 'Email or Username already registered'}), 400
        
        new_patient = Patient(full_name=full_name, username=username, email=email)
        new_patient.set_password(password)

        db.session.add(new_patient)
        db.session.commit()

        return jsonify({'message': 'Patient registered successfully'}), 201

    elif role == 'doctor':
        # Register as a doctor
        if Doctor.query.filter_by(email=email).first() or Doctor.query.filter_by(username=username).first():
            return jsonify({'error': 'Email or Username already registered'}), 400

        if not specialization:
            return jsonify({'error': 'Specialization is required for doctors'}), 400
        
        new_doctor = Doctor(full_name=full_name, username=username, email=email, specialization=specialization)
        new_doctor.set_password(password)

        db.session.add(new_doctor)
        db.session.commit()

        return jsonify({'message': 'Doctor registered successfully'}), 201

    else:
        return jsonify({'error': 'Invalid role'}), 400


# Login route
@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if role == 'patient':
        # Login as a patient
        patient = Patient.query.filter_by(email=email).first()

        if patient and patient.check_password(password):
            token = create_access_token(identity=patient.id)
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'username': patient.username,
                'full_name': patient.full_name,
                'role': 'patient'  # Return role
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    elif role == 'doctor':
        # Login as a doctor
        doctor = Doctor.query.filter_by(email=email).first()

        if doctor and doctor.check_password(password):
            token = create_access_token(identity=doctor.id)
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'username': doctor.username,
                'specialization': doctor.specialization,
                'role': 'doctor'  # Return role
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    else:
        return jsonify({'error': 'Invalid role'}), 400


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
    patient_id = get_jwt_identity()
    doctor_id = data.get('doctor_id')

    # Validate that doctor_id is provided and valid
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Invalid or missing doctor selection'}), 400

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
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=data['date'],
        time_from=data['time_from'],
        time_to=data['time_to'],
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
        return jsonify({'error': 'Cannot update an appointment in the past'}), 400

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


@app.route("/ShowAppointment/<int:appointment_id>", methods=['DELETE'])
@jwt_required()
def delete_appointments(appointment_id):
    current_user_id = get_jwt_identity() 

    appointment = Appointment.query.filter_by(id=appointment_id, user_id=current_user_id).first()
    
    if appointment:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify(message='Appointment deleted successfuly'), 202
    else:
        return jsonify(message='Appointment not found'), 404

# Show all doctors (to display in the appointment creation form for patients)
@app.route("/doctors", methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    doctors_list = [{'id': doctor.id, 'full_name': doctor.full_name, 'specialization': doctor.specialization} for doctor in doctors]
    return jsonify({'doctors': doctors_list}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)