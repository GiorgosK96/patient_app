import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function ManageAppointment() {
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username');  // Get the username from localStorage
  const navigate = useNavigate();  // Initialize useNavigate

  useEffect(() => {
    fetch('/manageAppointment', {
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
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to load appointments. Please try again later.');
      });
  }, []);

  const handleCreateAppointment = () => {
    navigate("/AddAppointment");  // Redirect to create appointment page
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');  // Redirect to login page
  };

  return (
    <div>
      <h2>Manage Appointments</h2>
      {message && <p>{message}</p>}
      {username && <p>Welcome, {username}!</p>}  {/* Display the username */}
      <button onClick={handleCreateAppointment}>Add Appointment</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ManageAppointment;
