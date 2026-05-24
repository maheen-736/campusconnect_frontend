import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const dashboardLink = () => {
    if (!user) return '/login';
    if (user.role_id === 1) return '/admin-dashboard';
    if (user.role_id === 2) return '/society-dashboard';
    return '/student-dashboard';
  };

  const roleLabel = () => {
    if (!user) return null;
    if (user.role_id === 1) return 'Admin';
    if (user.role_id === 2) return 'Society Head';
    return 'Student';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-dark-custom">
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" style={{
          fontFamily: "'Playfair Display', serif",
          background: 'linear-gradient(135deg, #F97316, #FED7AA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.4rem', fontWeight: '900',
          textDecoration: 'none', letterSpacing: '-0.5px'
        }}>
          Campus Connect
        </Link>

        <div className="d-flex align-items-center gap-4">
          {[
            { to: '/', label: 'Home' },
            { to: '/events', label: 'Events' },
            { to: '/societies', label: 'Societies' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              color: isActive(link.to) ? '#F97316' : '#A8A29E',
              textDecoration: 'none', fontSize: '0.875rem',
              fontWeight: isActive(link.to) ? '700' : '500',
              transition: 'color 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <Link to={dashboardLink()} style={{
                color: location.pathname.includes('dashboard') ? '#F97316' : '#A8A29E',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600'
              }}>
                Dashboard
              </Link>
              <span className="badge-role">{roleLabel()}</span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#F97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: '800', color: 'white'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid #3C3836',
                color: '#A8A29E', borderRadius: '10px', padding: '6px 16px',
                fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: '#A8A29E', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: '500'
              }}>
                Sign in
              </Link>
              <Link to="/register" className="btn-primary-custom btn px-4 py-2"
                style={{ fontSize: '0.875rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;