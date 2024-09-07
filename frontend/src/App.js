import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './register';


function App() {
  return (
    <Router>
      <Routes>
        {/* Set the landing page as the starting point */}
        <Route path="/" element={<LandingPage />} />
      
        {/* Registration page */}
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </Router>
  );
}

export default App;
