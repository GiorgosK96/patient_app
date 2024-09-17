import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateAppointment.css';  // Assuming you're adding a specific CSS file for this

export const UpdateAppointment = () => {
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(null); // Initialize the `isAccepted` state
  const [doctors, setDoctors] = useState([]);
  const { appointmentId } = useParams();
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Fetch doctors list on mount
  useEffect(() => {
    fetch('/doctors', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setDoctors(data.doctors);
      })
      .catch((error) => {
        console.error('Failed to fetch doctors', error);
      });
  }, []);

  // Fetch appointment details when the component mounts
  useEffect(() => {
    fetch(`/ShowAppointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setDate(data.date);
        setTimeFrom(data.time_from);
        setTimeTo(data.time_to);
        setDoctorId(data.doctor.id); // Use doctor ID instead of specialization
        setComment(data.comments);
      })
      .catch((error) => {
        console.error('Failed to fetch appointment', error);
        setMessage('Failed to load appointment details.');
        setIsAccepted(false); // Set as failure
      });
  }, [appointmentId]);

  const handleSubmit = () => {
    if (!date || !timeFrom || !timeTo || !doctorId) {
      setMessage('All fields are required');
      setIsAccepted(false); // Set failure
      return;
    }

    const data = {
      date,
      time_from: timeFrom,
      time_to: timeTo,
      doctor_id: doctorId,  // Update doctor ID
      comments: comment,
    };

    fetch(`/UpdateAppointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setMessage(`Error: ${data.error}`);
          setIsAccepted(false); // Set failure
        } else {
          setMessage(data.message);
          setIsAccepted(true); // Set success
        }
      })
      .catch((error) => {
        console.error('Error updating appointment:', error);
        setMessage('An error occurred');
        setIsAccepted(false); // Set failure
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleBackToManage = () => {
    navigate('/manageAppointment');
  };

  return (
    <div className="appointment-container">
      <h2 className="appointment-title">Update Appointment</h2>
      <form className="appointment-form">
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>From</label>
          <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name} ({doctor.specialization})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Comments</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button type="button" onClick={handleSubmit} className="appointment-button">Update Appointment</button>
      </form>

      <button onClick={handleLogout} className="logout-button">Logout</button>
      <button className="back-button" onClick={handleBackToManage}>Back to Manage Appointments</button>

      {message && (
        <p className={`message-text ${isAccepted ? 'success-text' : 'error-text'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateAppointment;
