import React, { useEffect, useState } from 'react';

function ManageAppointment() {
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username');  // Get the username from localStorage

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

  return (
    <div>
      <h2>Manage Appointments</h2>
      {message && <p>{message}</p>}
      {username && <p>Welcome, {username}!</p>}  {/* Display the username */}
    </div>
  );
}

export default ManageAppointment;
