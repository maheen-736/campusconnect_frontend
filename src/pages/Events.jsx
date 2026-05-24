import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Events() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      if (user) {
        const regRes = await api.get('/my-registrations');
        setRegistrations(regRes.data);
      }
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/register-event', { event_id: eventId });
      setMessage('Successfully registered.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const registeredEventIds = registrations.map(r => r.event_id);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const getSeatColor = (filled, capacity) => {
    const pct = filled / capacity;
    if (pct >= 0.9) return '#ef4444';
    if (pct >= 0.6) return '#f59e0b';
    return '#10b981';
  };

  const accentColors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="hero-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 style={{ fontWeight: '900', fontSize: '2.2rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                Discover Events
              </h1>
              <p style={{ color: '#64748b', marginBottom: 0 }}>
                Explore and register for events happening across NUML societies
              </p>
            </div>
            <div className="col-lg-5 mt-3 mt-lg-0">
              <div className="d-flex gap-4 justify-content-lg-end">
                {[
                  { num: upcoming.length, label: 'Upcoming', color: '#a855f7' },
                  { num: past.length, label: 'Past', color: '#64748b' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color }}>{s.num}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {message && <div className="alert-success-custom mb-4">{message}</div>}
        {error && <div className="alert-custom mb-4">{error}</div>}

        <div className="d-flex gap-2 mb-5">
          <button className={`tab-custom ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}>
            Upcoming ({upcoming.length})
          </button>
          <button className={`tab-custom ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}>
            Past Events ({past.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#7c3aed' }} role="status" />
            <p style={{ color: '#64748b', marginTop: '1rem' }}>Loading events...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
              {activeTab === 'upcoming' ? '📅' : '📂'}
            </div>
            <p style={{ color: '#64748b' }}>No {activeTab} events found.</p>
          </div>
        ) : (
          <div className="row g-4">
            {displayed.map((event, idx) => {
              const ac = accentColors[idx % accentColors.length];
              const filled = event.registrations_count || 0;
              const remaining = event.capacity - filled;
              const seatColor = getSeatColor(filled, event.capacity);
              const isRegistered = registeredEventIds.includes(event.id);
              const isPast = activeTab === 'past';

              return (
                <div className="col-md-6 col-lg-4" key={event.id}>
                  <div className="event-card" style={{ borderTop: `3px solid ${ac}` }}>
                    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="event-card-image" />
                      ) : (
                        <div className="event-card-image-placeholder"
                          style={{ background: `linear-gradient(135deg, ${ac}20, ${ac}08)` }}>
                          <span style={{ position: 'relative', zIndex: 1 }}>🎯</span>
                        </div>
                      )}
                    </Link>

                    <div style={{ padding: '1.25rem' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{
                          background: `${ac}18`, color: ac,
                          fontSize: '0.7rem', padding: '4px 10px',
                          borderRadius: '20px', fontWeight: '700',
                          border: `1px solid ${ac}28`
                        }}>
                          {formatDate(event.event_date)}
                        </span>
                        {event.society && <span className="society-tag">{event.society.name}</span>}
                      </div>

                      <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                        <h5 style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', marginBottom: '0.4rem' }}>
                          {event.title}
                        </h5>
                      </Link>

                      <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                        {event.description?.slice(0, 70)}...
                      </p>

                      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.75rem' }}>
                        <span>📍 {event.venue}</span>
                        <span style={{ marginLeft: '1rem' }}>🕐 {formatTime(event.event_date)}</span>
                      </div>

                      {/* Seat availability */}
                      {!isPast && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span style={{ color: '#475569' }}>Seats Available</span>
                            <span style={{ color: seatColor, fontWeight: '700' }}>
                              {remaining} / {event.capacity}
                            </span>
                          </div>
                          <div className="seat-bar">
                            <div className="seat-fill" style={{
                              width: `${(filled / event.capacity) * 100}%`,
                              background: seatColor
                            }} />
                          </div>
                          {remaining <= 10 && remaining > 0 && (
                            <p style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '4px', marginBottom: 0 }}>
                              Only {remaining} seats left!
                            </p>
                          )}
                          {remaining === 0 && (
                            <p style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '4px', marginBottom: 0 }}>
                              Event is full
                            </p>
                          )}
                        </div>
                      )}

                      {!isPast && user?.role_id === 3 && (
                        isRegistered ? (
                          <div className="registered-badge">Registered</div>
                        ) : remaining === 0 ? (
                          <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', borderRadius: '10px', padding: '0.5rem',
                            textAlign: 'center', fontSize: '0.85rem', fontWeight: '700'
                          }}>
                            Event Full
                          </div>
                        ) : (
                          <button className="btn-primary-custom btn w-100 py-2"
                            onClick={() => handleRegister(event.id)}>
                            Register Now
                          </button>
                        )
                      )}

                      {!isPast && !user && (
                        <Link to="/login" style={{
                          display: 'block', textAlign: 'center', padding: '0.5rem',
                          background: `${ac}12`, border: `1px solid ${ac}25`,
                          borderRadius: '10px', color: ac, textDecoration: 'none',
                          fontSize: '0.85rem', fontWeight: '700'
                        }}>
                          Login to Register
                        </Link>
                      )}

                      {isPast && (
                        <div style={{
                          background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.15)',
                          color: '#64748b', borderRadius: '10px', padding: '0.5rem',
                          textAlign: 'center', fontSize: '0.82rem', fontWeight: '600'
                        }}>
                          {event.recap ? 'View Recap →' : 'Event Ended'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Events;