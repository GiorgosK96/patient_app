import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './register';
import Login from './login';


function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<LandingPage />} />
      
        {}
        <Route path="/register" element={<Register />} />

        {}
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </Router>
  );
}

export default App;
