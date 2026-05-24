import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Home() {
  const [events, setEvents] = useState([]);
  const [societies, setSocieties] = useState([]);

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data)).catch(() => {});
    api.get('/societies').then(r => setSocieties(r.data)).catch(() => {});
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now).slice(0, 3);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const scColors = ['#F97316','#EF4444','#F59E0B','#8B5CF6','#06B6D4','#10B981'];
  const scIcons = ['💻','🎬','🚀','🧠','📖','⚽'];

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: '95vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', background: '#1C1917'
      }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-5%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 65%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,45,18,0.12), transparent 65%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '30px', padding: '6px 16px',
                fontSize: '0.75rem', color: '#FB923C',
                fontWeight: '700', letterSpacing: '1px',
                marginBottom: '2rem', textTransform: 'uppercase'
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#F97316', display: 'inline-block'
                }} />
                NUML University — Lahore Campus
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                fontWeight: '900', lineHeight: '1.05',
                letterSpacing: '-2px', marginBottom: '1.5rem',
                color: '#FFF7ED'
              }}>
                Where Campus{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #F97316, #FED7AA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block'
                }}>
                  Comes Alive.
                </span>
              </h1>

              <p style={{
                fontSize: '1.1rem', color: '#A8A29E',
                lineHeight: '1.9', marginBottom: '2.5rem', maxWidth: '480px'
              }}>
                Discover your society, register for events that matter, and become part of a campus community built for people like you.
              </p>

              <div className="d-flex gap-3 flex-wrap mb-5">
                <Link to="/events" className="btn-primary-custom btn px-5 py-3"
                  style={{ fontSize: '0.95rem', borderRadius: '14px' }}>
                  Explore Events
                </Link>
                <Link to="/societies" style={{
                  border: '1px solid #3C3836',
                  color: '#FFF7ED', borderRadius: '14px',
                  fontSize: '0.95rem', background: 'transparent',
                  textDecoration: 'none', padding: '0.75rem 2rem',
                  transition: 'all 0.2s', fontWeight: '600'
                }}>
                  View Societies
                </Link>
              </div>

              <div className="d-flex gap-5">
                {[
                  { num: societies.length, label: 'Societies' },
                  { num: upcoming.length, label: 'Upcoming Events' },
                  { num: events.length, label: 'Total Events' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#F97316', lineHeight: 1 }}>
                      {s.num}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#57534E', fontWeight: '600', marginTop: '4px' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Featured Event */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(124,45,18,0.08))',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: '20px', padding: '1.5rem', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)'
                  }} />
                  <p style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '0.75rem' }}>
                    NEXT UP
                  </p>
                  {upcoming[0] ? (
                    <>
                      <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#FFF7ED' }}>
                        {upcoming[0].title}
                      </h3>
                      <p style={{ color: '#A8A29E', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {upcoming[0].description?.slice(0, 75)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="event-date-badge">{formatDate(upcoming[0].event_date)}</span>
                        <Link to="/events" className="btn-primary-custom btn px-3 py-1" style={{ fontSize: '0.8rem' }}>
                          Register
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#A8A29E' }}>No upcoming events yet.</p>
                  )}
                </div>

                {/* Society mini cards */}
                {societies.slice(0, 4).map((s, i) => (
                  <Link key={s.id} to={`/societies/${s.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#292524',
                      border: `1px solid #3C3836`,
                      borderTop: `3px solid ${scColors[i % scColors.length]}`,
                      borderRadius: '16px', padding: '1.25rem',
                      transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = scColors[i % scColors.length]; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#3C3836'; e.currentTarget.style.borderTopColor = scColors[i % scColors.length]; }}
                    >
                      {s.cover_image_url ? (
                        <img src={s.cover_image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', marginBottom: '0.5rem' }} />
                      ) : (
                        <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{scIcons[i % scIcons.length]}</div>
                      )}
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFF7ED' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#57534E', marginTop: '2px' }}>
                        {s.members?.length || 0} members
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '900', fontSize: '1.8rem', marginBottom: '4px', color: '#FFF7ED' }}>
              Upcoming Events
            </h2>
            <p style={{ color: '#A8A29E', marginBottom: 0, fontSize: '0.875rem' }}>
              Don't miss what's happening across campus societies
            </p>
          </div>
          <Link to="/events" style={{
            color: '#F97316', textDecoration: 'none', fontSize: '0.875rem',
            fontWeight: '700', border: '1px solid rgba(249,115,22,0.2)',
            padding: '6px 16px', borderRadius: '10px'
          }}>
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#57534E' }}>
            No upcoming events at the moment.
          </div>
        ) : (
          <div className="row g-4">
            {upcoming.map((event, idx) => (
              <div className="col-md-4" key={event.id}>
                <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                  <div className={`event-card sc-${idx}`}>
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="event-card-image" />
                    ) : (
                      <div className="event-card-image-placeholder">
                        <span>🎯</span>
                      </div>
                    )}
                    <div style={{ padding: '1.25rem' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="event-date-badge">{formatDate(event.event_date)}</span>
                        {event.society && <span className="society-tag">{event.society.name}</span>}
                      </div>
                      <h5 style={{ fontWeight: '800', fontSize: '1rem', color: '#FFF7ED', marginBottom: '0.4rem' }}>
                        {event.title}
                      </h5>
                      <p style={{ color: '#A8A29E', fontSize: '0.82rem', marginBottom: '1rem' }}>
                        {event.venue}
                      </p>
                      <div style={{
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '10px', padding: '0.6rem', textAlign: 'center',
                        color: '#F97316', fontWeight: '700', fontSize: '0.85rem'
                      }}>
                        View Details →
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Societies Section */}
      <section style={{ borderTop: '1px solid #292524', borderBottom: '1px solid #292524', background: 'rgba(249,115,22,0.02)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '900', fontSize: '1.8rem', color: '#FFF7ED', marginBottom: '8px' }}>
              Our Societies
            </h2>
            <p style={{ color: '#A8A29E', fontSize: '0.875rem' }}>
              Six communities. One campus. Find where you belong.
            </p>
          </div>
          <div className="row g-4">
            {societies.map((s, i) => (
              <div className="col-md-4" key={s.id}>
                <Link to={`/societies/${s.id}`} style={{ textDecoration: 'none' }}>
                  <div className={`event-card sc-${i} p-4`}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {s.cover_image_url ? (
                        <img src={s.cover_image_url} alt={s.name} style={{
                          width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover'
                        }} />
                      ) : (
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '14px',
                          background: `${scColors[i % scColors.length]}22`,
                          border: `1px solid ${scColors[i % scColors.length]}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          {scIcons[i % scIcons.length]}
                        </div>
                      )}
                      <div>
                        <h5 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#FFF7ED', marginBottom: '2px' }}>
                          {s.name}
                        </h5>
                        {s.tagline && (
                          <p style={{ color: scColors[i % scColors.length], fontSize: '0.72rem', fontWeight: '600', marginBottom: 0 }}>
                            {s.tagline}
                          </p>
                        )}
                      </div>
                    </div>
                    <p style={{ color: '#A8A29E', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '1rem' }}>
                      {s.description?.slice(0, 100)}...
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: '0.78rem', color: '#57534E' }}>
                        <span style={{ color: scColors[i % scColors.length], fontWeight: '700' }}>
                          {s.members?.length || 0}
                        </span> members ·{' '}
                        <span style={{ color: scColors[i % scColors.length], fontWeight: '700' }}>
                          {s.events?.length || 0}
                        </span> events
                      </div>
                      <span style={{ color: scColors[i % scColors.length], fontSize: '0.82rem', fontWeight: '700' }}>
                        Explore →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #292524', padding: '3rem 0' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div style={{
                fontFamily: "'Playfair Display', serif",
                background: 'linear-gradient(135deg, #F97316, #FED7AA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontSize: '1.3rem', fontWeight: '900', marginBottom: '0.75rem'
              }}>
                Campus Connect
              </div>
              <p style={{ color: '#57534E', fontSize: '0.875rem', lineHeight: '1.7' }}>
                The digital home for NUML student societies. Discover, connect, and participate in campus life.
              </p>
            </div>
            <div className="col-md-4">
              <h6 style={{ fontWeight: '800', marginBottom: '1rem', fontSize: '0.78rem', letterSpacing: '1px', color: '#78716C', textTransform: 'uppercase' }}>
                Quick Links
              </h6>
              {[['/', 'Home'], ['/events', 'Events'], ['/societies', 'Societies'], ['/register', 'Join Now']].map(([to, label]) => (
                <div key={to} style={{ marginBottom: '0.5rem' }}>
                  <Link to={to} style={{ color: '#57534E', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
            <div className="col-md-4">
              <h6 style={{ fontWeight: '800', marginBottom: '1rem', fontSize: '0.78rem', letterSpacing: '1px', color: '#78716C', textTransform: 'uppercase' }}>
                Contact
              </h6>
              <p style={{ color: '#57534E', fontSize: '0.875rem', lineHeight: '1.7' }}>
                National University of Modern Languages<br />
                Islamabad, Pakistan<br />
                societies@numl.edu.pk
              </p>
            </div>
          </div>
          <hr style={{ borderColor: '#292524', margin: '2rem 0 1rem' }} />
          <div className="d-flex justify-content-between">
            <p style={{ color: '#3C3836', fontSize: '0.8rem', marginBottom: 0 }}>© 2026 Campus Connect — NUML</p>
            <p style={{ color: '#3C3836', fontSize: '0.8rem', marginBottom: 0 }}>React · Laravel · MySQL</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;