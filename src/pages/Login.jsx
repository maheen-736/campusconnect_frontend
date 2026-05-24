import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const roleId = res.data.user.role_id;
      if (roleId === 1) navigate('/admin-dashboard');
      else if (roleId === 2) navigate('/society-dashboard');
      else navigate('/student-dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(249,115,22,0.05), transparent 60%)'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '900', fontSize: '2rem', color: '#FFF7ED', marginBottom: '6px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#A8A29E', marginBottom: 0 }}>Sign in to your Campus Connect account</p>
          </div>

          <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '24px', padding: '2rem' }}>
            {error && <div className="alert-custom mb-4">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#78716C', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input type="email" className="form-control input-dark"
                  placeholder="you@numl.edu.pk" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#78716C', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input type="password" className="form-control input-dark"
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary-custom btn w-100 py-3" disabled={loading}
                style={{ fontSize: '0.95rem' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <hr style={{ borderColor: '#3C3836', margin: '1.5rem 0' }} />
            <p style={{ textAlign: 'center', color: '#78716C', marginBottom: 0, fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '700' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;