import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateAppointment.css';  // Assuming you're adding a specific CSS file for this

export const UpdateAppointment = () => {
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(null); // Initialize the `isAccepted` state
  const { appointmentId } = useParams();
  const navigate = useNavigate(); // Initialize navigate for redirection

  const specializations = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist'];

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
        setSpecialization(data.specialization);
        setComment(data.comments);
      })
      .catch((error) => {
        console.error('Failed to fetch appointment', error);
        setMessage('Failed to load appointment details.');
        setIsAccepted(false); // Set as failure
      });
  }, [appointmentId]);

  const handleSubmit = () => {
    if (!date || !timeFrom || !timeTo || !specialization) {
      setMessage('All fields are required');
      setIsAccepted(false); // Set failure
      return;
    }

    const data = {
      date,
      time_from: timeFrom,
      time_to: timeTo,
      specialization,
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
          <label>Specialization</label>
          <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
            <option value="">Select Specialization</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>
                {spec}
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

      {message && (
        <p className={`message-text ${isAccepted ? 'success-text' : 'error-text'}`}>
          {message}
        </p>
      )}

      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default UpdateAppointment;
