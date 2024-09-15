import { useNavigate } from 'react-router-dom';
import './manageAppointment.css';  

function ManageAppointment() {
  const navigate = useNavigate();

  const handleCreateAppointment = () => {
    navigate('/AddAppointment');
  };

  const handleShowAppointment = () => {
    navigate('/ShowAppointment');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="manage-container">
      <h2 className="manage-title">Manage Appointments</h2>
      <button className="manage-button add-appointment-button" onClick={handleCreateAppointment}>
        Add Appointment
      </button>
      <button className="manage-button show-appointment-button" onClick={handleShowAppointment}>
        Show Appointment
      </button>
      <button className="manage-button logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ManageAppointment;
