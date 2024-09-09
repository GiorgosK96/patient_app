import React from 'react';
import { BrowserRouter as Router, Route, Routes,} from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './register';
import Login from './login';
import ManageAppointment from './manageAppointment';




function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/LandingPage" element={<LandingPage />} />
      
        {}
        <Route path="/register" element={<Register />} />

        {}
        <Route path="/login" element={<Login />} />
        {}
        <Route path="/ManageAppointment" element={<ManageAppointment />} />
        
      </Routes>
    </Router>
  );
}

export default App;
