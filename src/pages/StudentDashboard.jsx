import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function StudentDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role_id !== 3) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regRes, eventsRes] = await Promise.all([
        api.get('/my-registrations'),
        api.get('/events')
      ]);
      setRegistrations(regRes.data);
      setEvents(eventsRes.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
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

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const registeredEventIds = registrations.map(r => r.event_id);
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const myUpcoming = registrations.filter(r => r.event && new Date(r.event.event_date) >= now);
  const myPast = registrations.filter(r => r.event && new Date(r.event.event_date) < now);

  if (loading) return (
    <>
      <Navbar />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border" style={{ color: '#6c63ff' }} role="status" />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="hero-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <p className="text-muted-custom mb-1" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                Student Portal
              </p>
              <h1 className="section-title mb-2">Welcome, {user?.name.split(' ')[0]}</h1>
              <p className="text-muted-custom mb-0">Track your registrations and discover new events</p>
            </div>
            <div className="col-lg-5 mt-3 mt-lg-0">
              <div className="d-flex gap-3 justify-content-lg-end">
                {[
                  { num: upcomingEvents.length, label: 'Available Events' },
                  { num: registrations.length, label: 'My Registrations' },
                  { num: myUpcoming.length, label: 'Upcoming' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', background: 'linear-gradient(135deg, #6c63ff, #f72585)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {s.num}
                    </div>
                    <div className="text-muted-custom" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {message && <div className="alert-success-custom mb-4">{message}</div>}
        {error && <div className="alert-custom mb-4">{error}</div>}

        <div className="d-flex gap-2 mb-4">
          {['available', 'my-events', 'past'].map(tab => (
            <button key={tab} className={`tab-custom ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'available' && `Available (${upcomingEvents.length})`}
              {tab === 'my-events' && `My Upcoming (${myUpcoming.length})`}
              {tab === 'past' && `Past (${myPast.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'available' && (
          <div className="row g-4">
            {upcomingEvents.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted-custom">No upcoming events available.</p>
              </div>
            ) : upcomingEvents.map(event => (
              <div className="col-md-6 col-lg-4" key={event.id}>
                <div className="event-card">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="event-card-image" />
                  ) : (
                    <div className="event-card-image-placeholder"><span>🎯</span></div>
                  )}
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="event-date-badge">{formatDate(event.event_date)}</span>
                      {event.society && <span className="society-tag">{event.society.name}</span>}
                    </div>
                    <h5 className="fw-700 mb-1" style={{ fontSize: '1rem' }}>{event.title}</h5>
                    <p className="text-muted-custom mb-3" style={{ fontSize: '0.85rem', flexGrow: 1 }}>
                      {event.description || 'No description.'}
                    </p>
                    <div className="mb-3" style={{ fontSize: '0.8rem' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted-custom">Venue</span>
                        <span>{event.venue}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted-custom">Time</span>
                        <span>{formatTime(event.event_date)}</span>
                      </div>
                    </div>
                    {registeredEventIds.includes(event.id) ? (
                      <div className="registered-badge">Registered</div>
                    ) : (
                      <button className="btn-primary-custom btn w-100 py-2"
                        onClick={() => handleRegister(event.id)}>
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-events' && (
          <div className="row g-4">
            {myUpcoming.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted-custom">You have no upcoming registered events.</p>
                <button className="btn-primary-custom btn px-4 py-2 mt-2"
                  onClick={() => setActiveTab('available')}>
                  Browse Events
                </button>
              </div>
            ) : myUpcoming.map(reg => (
              <div className="col-md-6 col-lg-4" key={reg.id}>
                <div className="event-card">
                  {reg.event?.image_url ? (
                    <img src={reg.event.image_url} alt={reg.event.title} className="event-card-image" />
                  ) : (
                    <div className="event-card-image-placeholder"><span>✅</span></div>
                  )}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="event-date-badge">{formatDate(reg.event?.event_date)}</span>
                      {reg.event?.society && <span className="society-tag">{reg.event.society.name}</span>}
                    </div>
                    <h5 className="fw-700 mb-1" style={{ fontSize: '1rem' }}>{reg.event?.title}</h5>
                    <p className="text-muted-custom mb-3" style={{ fontSize: '0.85rem' }}>
                      {reg.event?.description || 'No description.'}
                    </p>
                    <div className="mb-3" style={{ fontSize: '0.8rem' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted-custom">Venue</span>
                        <span>{reg.event?.venue}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted-custom">Time</span>
                        <span>{formatTime(reg.event?.event_date)}</span>
                      </div>
                    </div>
                    <div className="registered-badge">Registered</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="row g-4">
            {myPast.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted-custom">No past events attended.</p>
              </div>
            ) : myPast.map(reg => (
              <div className="col-md-6 col-lg-4" key={reg.id}>
                <div className="event-card" style={{ opacity: 0.75 }}>
                  {reg.event?.image_url ? (
                    <img src={reg.event.image_url} alt={reg.event.title} className="event-card-image"
                      style={{ filter: 'grayscale(40%)' }} />
                  ) : (
                    <div className="event-card-image-placeholder"><span>📂</span></div>
                  )}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="event-past-badge">{formatDate(reg.event?.event_date)}</span>
                      {reg.event?.society && <span className="society-tag">{reg.event.society.name}</span>}
                    </div>
                    <h5 className="fw-700 mb-1" style={{ fontSize: '1rem' }}>{reg.event?.title}</h5>
                    <p className="text-muted-custom mb-3" style={{ fontSize: '0.85rem' }}>
                      {reg.event?.venue}
                    </p>
                    <div className="registered-badge" style={{
                      background: 'rgba(107,114,128,0.08)',
                      border: '1px solid rgba(107,114,128,0.2)',
                      color: '#6b7280'
                    }}>
                      Attended
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default StudentDashboard;