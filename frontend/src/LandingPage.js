import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Patient Appointment App</h1>
      <p>Please choose an option:</p>
      <div style={{ margin: '20px' }}>
        <Link to="/login">
          <button style={{ marginRight: '10px' }}>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
