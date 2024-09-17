import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '' // Add specialization field
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      newErrors.specialization = 'Specialization is required for doctors';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), 
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error); 
        } else {
          setMessage(data.message); 
          navigate("/login"); 
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('An error occurred.');
      });
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleBackToLanding = () => {
    navigate("/");
  };

  return (
    <div className="register-container">
      <h2 className="register-title">User Registration</h2>
      <form onSubmit={handleSubmit} noValidate className="register-form">
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        {errors.username && <p className="error-text">{errors.username}</p>}
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
         {errors.password && <p className="error-text">{errors.password}</p>}
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {/* Conditionally render the specialization field if role is doctor */}
        {formData.role === 'doctor' && (
          <div className="form-group">
            <label>Specialization:</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
            {errors.specialization && <p className="error-text">{errors.specialization}</p>}
          </div>
        )}

        <button type="submit" className="register-button">Register</button>
        <div>
          <button onClick={handleLoginRedirect} className="login-redirect-button">Go to Login</button>
        </div>
      </form>
      {message && <p className="message-text">{message}</p>}

      <button onClick={handleBackToLanding} className="back-button">Back to Landing Page</button>
    </div>
  );
}

export default Register;
