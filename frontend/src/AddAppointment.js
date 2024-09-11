import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

export const AddAppointment = () => {
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();  // Initialize useNavigate

  const specializations = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist'];

  const handleSubmit = () => {
    // Validate fields before submitting
    if (!date || !timeFrom || !timeTo || !specialization) {
      setMessage('All fields are required');
      return;
    }

    const data = {
      date,
      time_from: timeFrom,
      time_to: timeTo,
      specialization,
      comments: comment,
    };

    // Send the request to the backend
    fetch('/AddAppointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          setMessage('Appointment created successfully');
          setIsAccepted(true);
          setDate('');
          setTimeFrom('');
          setTimeTo('');
          setSpecialization('');
          setComment('');
        } else {
          setMessage('Failed to create appointment');
        }
      })
      .catch((error) => {
        setMessage('An error occurred');
        console.error(error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');  // Redirect to login page
  };

  return (
    <div className="add-appointment">
      <h2>Create Appointment</h2>
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
      <button onClick={handleSubmit}>Add Appointment</button>
      {message && <p>{isAccepted ? 'Success' : 'Error'}: {message}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AddAppointment;
