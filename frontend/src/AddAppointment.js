import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddAppointment.css';

export const AddAppointment = () => {
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(null);
  const navigate = useNavigate(); 

  const specializations = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist'];

  const handleSubmit = () => {
 
    if (!date || !timeFrom || !timeTo || !specialization) {
      setMessage('All fields are required');
      setIsAccepted(false);
      return;
    }

    const data = {
      date,
      time_from: timeFrom,
      time_to: timeTo,
      specialization,
      comments: comment,
    };

    fetch('/AddAppointment', {
      method: 'POST',
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
          setIsAccepted(false);
        } else {
          setMessage(data.message);
          setIsAccepted(true);
          setDate('');
          setTimeFrom('');
          setTimeTo('');
          setSpecialization('');
          setComment('');
        }
      })
      .catch((error) => {
        setMessage('An error occurred');
        setIsAccepted(false);
        console.error(error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login'); 
  };

  return (
    <div className="appointment-container">
      <h2 className="appointment-title">Create Appointment</h2>
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
        <button type="button" onClick={handleSubmit} className="appointment-button">Add Appointment</button>
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

export default AddAppointment;
