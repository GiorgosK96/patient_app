import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="page-container">
      <h1 className="title">Patient Appointment Application</h1>

      <div className="auth-buttons">
      <p className="register-text">If you are a new user you can register here!</p>
        <Link to="/register">
          <button className="register-button">Register</button>
        </Link>

        <p className="login-text">Already have an account?</p>

        <Link to="/login">
          <button className="login-button">Login</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
