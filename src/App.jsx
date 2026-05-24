import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import StudentDashboard from './pages/StudentDashboard';
import SocietyHeadDashboard from './pages/SocietyHeadDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Societies from './pages/Societies';
import SocietyDetail from './pages/SocietyDetail';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/societies" element={<Societies />} />
        <Route path="/societies/:id" element={<SocietyDetail />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/society-dashboard" element={<SocietyHeadDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;