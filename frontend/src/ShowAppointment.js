import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ShowAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the appointments when the component is mounted
    fetch('/ShowAppointment', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`  // Include the token in the Authorization header
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch appointments');
        }
      })
      .then(data => {
        setAppointments(data.appointments); // Set the appointments in state
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to load appointments. Please try again later.');
      });
  }, []); // This will fetch appointments once when the component is mounted

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div>
      <h2>Show Appointments</h2>
      {message && <p>{message}</p>}
      <ul>
        {appointments.map((appointment, index) => (
          <li key={index}>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>From:</strong> {appointment.time_from}</p>
            <p><strong>To:</strong> {appointment.time_to}</p>
            <p><strong>Specialization:</strong> {appointment.specialization}</p>
            <p><strong>Comments:</strong> {appointment.comments}</p>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ShowAppointment;
