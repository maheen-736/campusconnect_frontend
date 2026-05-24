import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: 3, society_id: '' });
  const [societies, setSocieties] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/societies').then(r => setSocieties(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const value = e.target.name === 'role_id' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (form.role_id !== 2) delete payload.society_id;
      const res = await api.post('/register', payload);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const roleId = res.data.user.role_id;
      if (roleId === 2) navigate('/society-dashboard');
      else if (roleId === 3) navigate('/student-dashboard');
      else navigate('/');
    } catch (err) {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
        <div className="card-dark p-5" style={{ width: '100%', maxWidth: '460px' }}>
          <div className="mb-4">
            <h2 style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '4px' }}>Create account</h2>
            <p className="text-muted-custom mb-0">Join Campus Connect today</p>
          </div>

          {error && <div className="alert-custom mb-4">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>FULL NAME</label>
              <input type="text" name="name" className="form-control input-dark"
                placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
              <input type="email" name="email" className="form-control input-dark"
                placeholder="you@numl.edu.pk" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>PASSWORD</label>
              <input type="password" name="password" className="form-control input-dark"
                placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>I AM A</label>
              <select name="role_id" className="form-select input-dark" value={form.role_id} onChange={handleChange}>
                <option value={3}>Student</option>
                <option value={2}>Society Head</option>
              </select>
            </div>

            {form.role_id === 2 && (
              <div className="mb-3">
                <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>SELECT YOUR SOCIETY</label>
                <select name="society_id" className="form-select input-dark" value={form.society_id} onChange={handleChange} required>
                  <option value="">-- Select Society --</option>
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary-custom btn w-100 py-2 mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <hr className="divider my-4" />
          <p className="text-center text-muted-custom mb-0" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6c63ff', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;