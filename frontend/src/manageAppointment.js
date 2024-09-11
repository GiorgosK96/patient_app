import { useNavigate } from 'react-router-dom';

function ManageAppointment() {
  const navigate = useNavigate();

  const handleCreateAppointment = () => {
    navigate('/AddAppointment');  // Redirect to add appointment page
  };

  const handleShowAppointment = () => {
    navigate('/ShowAppointment');  // Redirect to show appointment page
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div>
      <h2>Manage Appointments</h2>
      <button onClick={handleCreateAppointment}>Add Appointment</button>
      <button onClick={handleShowAppointment}>Show Appointment</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ManageAppointment;
