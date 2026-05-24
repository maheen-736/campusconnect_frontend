import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get(`/events/${id}`).then(r => {
      setEvent(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/register-event', { event_id: id });
      setMessage('Successfully registered for this event.');
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const now = new Date();

  if (loading) return (
    <>
      <Navbar />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" style={{ color: '#F97316' }} role="status" />
      </div>
    </>
  );

  if (!event) return (
    <>
      <Navbar />
      <div className="container py-5 text-center">
        <p style={{ color: '#A8A29E' }}>Event not found.</p>
        <Link to="/events" style={{ color: '#F97316' }}>Back to Events</Link>
      </div>
    </>
  );

  const isPast = new Date(event.event_date) < now;
  const filled = event.registrations_count || 0;
  const remaining = event.capacity - filled;
  const seatPct = (filled / event.capacity) * 100;
  const seatColor = seatPct >= 90 ? '#EF4444' : seatPct >= 60 ? '#F59E0B' : '#10B981';

  return (
    <>
      <Navbar />

      {/* Cover */}
      <div style={{
        width: '100%', height: '360px', position: 'relative', overflow: 'hidden',
        background: event.image_url ? 'none' : 'linear-gradient(135deg, rgba(249,115,22,0.1), #1C1917)'
      }}>
        {event.image_url && (
          <img src={event.image_url} alt={event.title} style={{
            width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)'
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #1C1917 0%, transparent 60%)'
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem'
        }}>
          <div className="container">
            <Link to="/events" style={{ color: '#A8A29E', textDecoration: 'none', fontSize: '0.85rem' }}>
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          {/* Main */}
          <div className="col-lg-8">
            <div className="d-flex gap-2 flex-wrap mb-3">
              {event.society && <span className="society-tag">{event.society.name}</span>}
              <span className={isPast ? 'event-past-badge' : 'event-date-badge'}>
                {isPast ? 'Past Event' : 'Upcoming'}
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: '900', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: '1.15', color: '#FFF7ED', margin: '0.75rem 0 1rem',
              letterSpacing: '-0.5px'
            }}>
              {event.title}
            </h1>

            <div className="d-flex flex-wrap gap-4 mb-4" style={{ fontSize: '0.875rem', color: '#A8A29E' }}>
              <span>📅 {formatDate(event.event_date)}</span>
              <span>🕐 {formatTime(event.event_date)}</span>
              <span>📍 {event.venue}</span>
            </div>

            {message && <div className="alert-success-custom mb-4">{message}</div>}
            {error && <div className="alert-custom mb-4">{error}</div>}

            <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h5 style={{ fontWeight: '700', marginBottom: '1rem', color: '#FFF7ED' }}>About this event</h5>
              <p style={{ color: '#A8A29E', lineHeight: '1.9', fontSize: '0.95rem', marginBottom: 0 }}>
                {event.description || 'No description provided.'}
              </p>
            </div>

            {isPast && event.recap && (
              <div style={{ background: '#292524', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '20px', overflow: 'hidden' }}>
                {event.recap_image_url && (
                  <img src={event.recap_image_url} alt="Recap"
                    style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.75rem' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span style={{ fontSize: '1.2rem' }}>📋</span>
                    <h5 style={{ fontWeight: '800', marginBottom: 0, color: '#F97316', fontSize: '1rem' }}>
                      Event Recap
                    </h5>
                  </div>
                  <p style={{ color: '#A8A29E', lineHeight: '1.9', fontSize: '0.95rem', marginBottom: 0 }}>
                    {event.recap}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div style={{
              background: '#292524', border: '1px solid #3C3836',
              borderRadius: '20px', padding: '1.5rem',
              position: 'sticky', top: '80px'
            }}>
              <h6 style={{ fontWeight: '700', marginBottom: '1.25rem', color: '#78716C', fontSize: '0.75rem', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Event Details
              </h6>

              {[
                { label: 'Date', val: formatDate(event.event_date) },
                { label: 'Time', val: formatTime(event.event_date) },
                { label: 'Venue', val: event.venue },
                { label: 'Capacity', val: `${event.capacity} seats` },
                { label: 'Organizer', val: event.society?.name || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="d-flex justify-content-between py-2"
                  style={{ borderBottom: i < 4 ? '1px solid #3C3836' : 'none' }}>
                  <span style={{ color: '#78716C', fontSize: '0.82rem' }}>{item.label}</span>
                  <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#FFF7ED', textAlign: 'right', maxWidth: '55%' }}>
                    {item.val}
                  </span>
                </div>
              ))}

              {!isPast && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                    <span style={{ color: '#78716C' }}>Seat Availability</span>
                    <span style={{ color: seatColor, fontWeight: '700' }}>
                      {remaining} / {event.capacity} remaining
                    </span>
                  </div>
                  <div className="seat-bar">
                    <div className="seat-fill" style={{ width: `${seatPct}%`, background: seatColor }} />
                  </div>
                  {remaining <= 10 && remaining > 0 && (
                    <p style={{ color: '#EF4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '4px', marginBottom: 0 }}>
                      Only {remaining} seats left — register now!
                    </p>
                  )}
                  {remaining === 0 && (
                    <p style={{ color: '#EF4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '4px', marginBottom: 0 }}>
                      Event is full
                    </p>
                  )}
                </div>
              )}

              {/* ✅ UPDATED: Registration button section with external URL support */}
              <div style={{ marginTop: '1.5rem' }}>
                {!isPast && event.registration_url && (
                  <a href={event.registration_url} target="_blank" rel="noreferrer"
                    className="btn-primary-custom btn w-100 py-3 text-center d-block mb-2"
                    style={{ fontSize: '0.95rem', textDecoration: 'none' }}>
                    Register via External Link →
                  </a>
                )}
                {!isPast && !event.registration_url && user?.role_id === 3 && remaining > 0 && (
                  <button className="btn-primary-custom btn w-100 py-3"
                    style={{ fontSize: '0.95rem' }} onClick={handleRegister}>
                    Register for Event
                  </button>
                )}
                {!isPast && !event.registration_url && user?.role_id === 3 && remaining === 0 && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#FCA5A5', borderRadius: '12px', padding: '0.875rem',
                    textAlign: 'center', fontWeight: '700'
                  }}>
                    Event Full
                  </div>
                )}
                {!isPast && !event.registration_url && !user && (
                  <Link to="/login" className="btn-primary-custom btn w-100 py-3 text-center"
                    style={{ fontSize: '0.95rem', textDecoration: 'none' }}>
                    Login to Register
                  </Link>
                )}
                {isPast && (
                  <div style={{
                    background: 'rgba(168,162,158,0.08)', border: '1px solid rgba(168,162,158,0.15)',
                    color: '#A8A29E', borderRadius: '12px', padding: '0.875rem',
                    textAlign: 'center', fontWeight: '600', fontSize: '0.875rem'
                  }}>
                    This event has ended
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetail;
