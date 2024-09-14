import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ShowAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/ShowAppointment', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        setAppointments(data.appointments);
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Failed to load appointments. Please try again later.');
      });
  }, []);

  const handleEditAppointment = (appointmentId) => {
    navigate(`/UpdateAppointment/${appointmentId}`);
  };

  const [isSuccess, setIsSuccess] = useState(null);  // Track if the operation was successful

  const handleDeleteAppointment = (appointmentId) => {
    fetch(`/ShowAppointment/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then(data => {
            setMessage(data.message);  // Use the message from the backend
            setIsSuccess(true);        // Set success status
            setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
          });
        } else {
          response.json().then(data => {
            setMessage(data.message);  // Use the message from the backend
            setIsSuccess(false);       // Set error status
          });
        }
      })
      .catch((error) => {
        console.error('Error deleting appointment:', error);
        setMessage('An error occurred');
        setIsSuccess(false);            // Set error status
      });
  };
  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div>
      <h2>Show Appointments</h2>
      {message && (
        <p style={{ color: isSuccess ? 'green' : 'red' }}>
      {message}
        </p>
        )}
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>From:</strong> {appointment.time_from}</p>
            <p><strong>To:</strong> {appointment.time_to}</p>
            <p><strong>Specialization:</strong> {appointment.specialization}</p>
            <p><strong>Comments:</strong> {appointment.comments}</p>
            <button onClick={() => handleEditAppointment(appointment.id)}>Edit</button>
            <button onClick={() => handleDeleteAppointment(appointment.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ShowAppointment;

