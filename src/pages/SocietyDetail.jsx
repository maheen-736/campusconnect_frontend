import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function SocietyDetail() {
  const { id } = useParams();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const scColors = ['#F97316','#EF4444','#F59E0B','#8B5CF6','#06B6D4','#10B981'];

  useEffect(() => {
    api.get(`/societies/${id}`).then(r => {
      setSociety(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
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

  if (!society) return (
    <>
      <Navbar />
      <div className="container py-5 text-center">
        <p style={{ color: '#A8A29E' }}>Society not found.</p>
        <Link to="/societies" style={{ color: '#F97316' }}>Back to Societies</Link>
      </div>
    </>
  );

  const upcomingEvents = society.events?.filter(e => new Date(e.event_date) >= now) || [];
  const pastEvents = society.events?.filter(e => new Date(e.event_date) < now) || [];
  const societyIndex = (parseInt(id) - 1) % scColors.length;
  const ac = scColors[societyIndex] || '#F97316';

  return (
    <>
      <Navbar />

      {/* Cover */}
      <div style={{
        width: '100%', height: '280px', position: 'relative', overflow: 'hidden',
        background: society.cover_image_url ? 'none' : `linear-gradient(135deg, ${ac}15, #1C1917)`,
        borderBottom: '1px solid #292524'
      }}>
        {society.cover_image_url && (
          <img src={society.cover_image_url} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)'
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #1C1917 0%, transparent 60%)'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '2rem'
        }}>
          <div className="container">
            <Link to="/societies" style={{ color: '#A8A29E', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
              ← Back to Societies
            </Link>
            <div className="d-flex align-items-end justify-content-between mt-3">
              <div>
                <span style={{
                  background: `${ac}20`, border: `1px solid ${ac}35`,
                  color: ac, fontSize: '0.72rem', padding: '3px 12px',
                  borderRadius: '20px', fontWeight: '700',
                  display: 'inline-block', marginBottom: '0.5rem'
                }}>
                  Est. {society.founded_at || 'N/A'}
                </span>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '900', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  color: '#FFF7ED', marginBottom: '4px', letterSpacing: '-0.5px'
                }}>
                  {society.name}
                </h1>
                {society.tagline && (
                  <p style={{ color: ac, fontWeight: '600', marginBottom: 0, fontSize: '0.95rem' }}>
                    {society.tagline}
                  </p>
                )}
              </div>
              <div className="d-flex gap-4 d-none d-md-flex">
                {[
                  { num: society.members?.length || 0, label: 'Members' },
                  { num: upcomingEvents.length, label: 'Upcoming' },
                  { num: pastEvents.length, label: 'Past Events' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: ac }}>{s.num}</div>
                    <div style={{ fontSize: '0.7rem', color: '#A8A29E', fontWeight: '600' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Tabs */}
        <div className="d-flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'about', label: 'About' },
            { key: 'events', label: `Events (${society.events?.length || 0})` },
            { key: 'members', label: `Team (${society.members?.length || 0})` },
            { key: 'recaps', label: `Recaps (${pastEvents.filter(e => e.recap).length})` },
          ].map(tab => (
            <button key={tab.key}
              className={`tab-custom ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? { background: ac, borderColor: ac } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* About */}
        {activeTab === 'about' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div style={{
                background: '#292524', border: '1px solid #3C3836',
                borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem'
              }}>
                <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '700', marginBottom: '1rem', color: '#FFF7ED' }}>
                  About {society.name}
                </h5>
                <p style={{ color: '#A8A29E', lineHeight: '1.9', fontSize: '0.95rem', marginBottom: 0 }}>
                  {society.description}
                </p>
              </div>

              {upcomingEvents.length > 0 && (
                <div style={{ background: '#292524', border: `1px solid ${ac}30`, borderRadius: '20px', padding: '1.5rem' }}>
                  <h6 style={{ fontWeight: '700', marginBottom: '1rem', color: ac, fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Next Event
                  </h6>
                  <div className="d-flex align-items-start gap-3">
                    {upcomingEvents[0].image_url ? (
                      <img src={upcomingEvents[0].image_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: `${ac}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🎯</div>
                    )}
                    <div>
                      <h6 style={{ fontWeight: '800', marginBottom: '4px', color: '#FFF7ED' }}>{upcomingEvents[0].title}</h6>
                      <p style={{ color: '#A8A29E', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                        {upcomingEvents[0].venue} · {formatDate(upcomingEvents[0].event_date)}
                      </p>
                      <Link to="/events" className="btn-primary-custom btn px-3 py-1" style={{ fontSize: '0.8rem', background: ac }}>
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              {/* Quick Stats */}
              <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h6 style={{ fontWeight: '700', marginBottom: '1rem', color: '#A8A29E', fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Quick Stats
                </h6>
                {[
                  { label: 'Founded', val: society.founded_at || 'N/A' },
                  { label: 'Members', val: society.members?.length || 0 },
                  { label: 'Total Events', val: society.events?.length || 0 },
                  { label: 'Upcoming', val: upcomingEvents.length },
                  { label: 'Past Events', val: pastEvents.length },
                  { label: 'Recaps', val: pastEvents.filter(e => e.recap).length },
                ].map((item, i, arr) => (
                  <div key={i} className="d-flex justify-content-between py-2"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid #3C3836' : 'none' }}>
                    <span style={{ color: '#78716C', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#FFF7ED' }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* ✅ NEW: Social Links */}
              {(society.instagram || society.facebook || society.linkedin ||
                society.tiktok || society.twitter || society.whatsapp) && (
                <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem' }}>
                  <h6 style={{ fontWeight: '700', marginBottom: '1rem', color: '#A8A29E', fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Follow Us
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { key: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
                      { key: 'facebook', label: 'Facebook', icon: '👥', color: '#1877F2' },
                      { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
                      { key: 'tiktok', label: 'TikTok', icon: '🎵', color: '#FF0050' },
                      { key: 'twitter', label: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
                      { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
                    ].filter(s => society[s.key]).map(s => (
                      <a key={s.key} href={society[s.key]} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.875rem',
                        background: `${s.color}12`, border: `1px solid ${s.color}25`,
                        borderRadius: '10px', textDecoration: 'none',
                        color: s.color, fontWeight: '700', fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}>
                        <span>{s.icon}</span>
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '20px', padding: '1.5rem' }}>
                <h6 style={{ fontWeight: '700', marginBottom: '0.75rem', color: '#A8A29E', fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  All Events
                </h6>
                <Link to="/events" style={{
                  display: 'block', textAlign: 'center', padding: '0.6rem',
                  background: `${ac}12`, border: `1px solid ${ac}25`,
                  borderRadius: '10px', color: ac,
                  textDecoration: 'none', fontSize: '0.875rem', fontWeight: '700'
                }}>
                  Browse All Events →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <div>
            {upcomingEvents.length > 0 && (
              <div className="mb-5">
                <h5 style={{ fontWeight: '800', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#A8A29E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Upcoming
                </h5>
                <div className="row g-4">
                  {upcomingEvents.map(event => (
                    <div className="col-md-6 col-lg-4" key={event.id}>
                      <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                        <div className="event-card" style={{ borderTop: `3px solid ${ac}` }}>
                          {event.image_url ? (
                            <img src={event.image_url} alt="" className="event-card-image" />
                          ) : (
                            <div className="event-card-image-placeholder" style={{ background: `${ac}10` }}>
                              <span>🎯</span>
                            </div>
                          )}
                          <div style={{ padding: '1.25rem' }}>
                            <span className="event-date-badge mb-2 d-inline-block">
                              {formatDate(event.event_date)}
                            </span>
                            <h5 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#FFF7ED', margin: '0.5rem 0' }}>
                              {event.title}
                            </h5>
                            <p style={{ color: '#A8A29E', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                              {event.venue}
                            </p>
                            <div style={{
                              background: `${ac}12`, border: `1px solid ${ac}22`,
                              borderRadius: '8px', padding: '0.5rem',
                              textAlign: 'center', color: ac,
                              fontWeight: '700', fontSize: '0.82rem'
                            }}>
                              Register Now →
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h5 style={{ fontWeight: '800', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#A8A29E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Past Events
                </h5>
                <div className="row g-4">
                  {pastEvents.map(event => (
                    <div className="col-md-6 col-lg-4" key={event.id}>
                      <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                        <div className="event-card" style={{ opacity: 0.75 }}>
                          {event.image_url ? (
                            <img src={event.image_url} alt="" className="event-card-image"
                              style={{ filter: 'grayscale(30%)' }} />
                          ) : (
                            <div className="event-card-image-placeholder"><span>📂</span></div>
                          )}
                          <div style={{ padding: '1.25rem' }}>
                            <span className="event-past-badge mb-2 d-inline-block">
                              {formatDate(event.event_date)}
                            </span>
                            <h5 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#FFF7ED', margin: '0.5rem 0' }}>
                              {event.title}
                            </h5>
                            <p style={{ color: '#A8A29E', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                              {event.venue}
                            </p>
                            {event.recap && (
                              <div style={{
                                background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)',
                                borderRadius: '8px', padding: '0.5rem',
                                textAlign: 'center', color: '#F97316',
                                fontWeight: '700', fontSize: '0.8rem'
                              }}>
                                Read Recap →
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {society.events?.length === 0 && (
              <div className="text-center py-5">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <p style={{ color: '#A8A29E' }}>No events yet for this society.</p>
              </div>
            )}
          </div>
        )}

        {/* Members / Team */}
        {activeTab === 'members' && (
          <div>
            {society.members?.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p style={{ color: '#A8A29E' }}>No team members added yet.</p>
              </div>
            ) : (
              <div>
                {/* Head Member */}
                <div className="text-center mb-5">
                  {(() => {
                    const head = society.members[0];
                    return (
                      <div style={{ display: 'inline-block' }}>
                        {head.photo_url ? (
                          <img src={head.photo_url} alt={head.name} style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            objectFit: 'cover', marginBottom: '1rem',
                            border: `4px solid ${ac}`,
                            boxShadow: `0 0 40px ${ac}30`
                          }} />
                        ) : (
                          <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: ac, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '2.5rem', fontWeight: '900',
                            color: 'white', margin: '0 auto 1rem',
                            boxShadow: `0 0 40px ${ac}30`
                          }}>
                            {head.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '800', fontSize: '1.3rem', color: '#FFF7ED', marginBottom: '0.4rem' }}>
                          {head.name}
                        </h3>
                        <span style={{
                          background: ac, color: 'white',
                          fontSize: '0.75rem', padding: '4px 16px',
                          borderRadius: '20px', fontWeight: '700'
                        }}>
                          {head.role}
                        </span>
                        {head.email && (
                          <p style={{ color: '#A8A29E', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                            {head.email}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {society.members.length > 1 && (
                  <>
                    <h5 style={{ fontWeight: '800', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#A8A29E', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>
                      Team Members
                    </h5>
                    <div className="row g-4">
                      {society.members.slice(1).map(member => (
                        <div className="col-md-4 col-lg-3" key={member.id}>
                          <div style={{
                            background: '#292524', border: '1px solid #3C3836',
                            borderRadius: '20px', padding: '1.75rem 1.25rem',
                            textAlign: 'center', transition: 'all 0.3s'
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = ac; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${ac}15`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3C3836'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={member.name} style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                objectFit: 'cover', marginBottom: '0.875rem',
                                border: `2px solid ${ac}40`
                              }} />
                            ) : (
                              <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: `${ac}20`, border: `2px solid ${ac}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.6rem', fontWeight: '800', color: ac,
                                margin: '0 auto 0.875rem'
                              }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <h6 style={{ fontWeight: '800', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#FFF7ED' }}>
                              {member.name}
                            </h6>
                            <span style={{
                              background: `${ac}12`, border: `1px solid ${ac}22`,
                              color: ac, fontSize: '0.7rem',
                              padding: '3px 12px', borderRadius: '20px', fontWeight: '700'
                            }}>
                              {member.role}
                            </span>
                            {member.email && (
                              <p style={{ color: '#57534E', fontSize: '0.72rem', marginTop: '0.5rem', marginBottom: 0, wordBreak: 'break-all' }}>
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recaps */}
        {activeTab === 'recaps' && (
          <div>
            {pastEvents.filter(e => e.recap).length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ color: '#A8A29E' }}>No event recaps available yet.</p>
              </div>
            ) : (
              <div className="row g-4">
                {pastEvents.filter(e => e.recap).map(event => (
                  <div className="col-lg-6" key={event.id}>
                    <div style={{ background: '#292524', border: '1px solid #3C3836', borderRadius: '20px', overflow: 'hidden' }}>
                      {event.recap_image_url && (
                        <img src={event.recap_image_url} alt=""
                          style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                      )}
                      <div style={{ padding: '1.5rem' }}>
                        <span className="event-past-badge mb-2 d-inline-block">
                          {formatDate(event.event_date)}
                        </span>
                        <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '800', fontSize: '1.1rem', color: '#FFF7ED', margin: '0.5rem 0 1rem' }}>
                          {event.title}
                        </h5>
                        <p style={{ color: '#A8A29E', lineHeight: '1.85', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          {event.recap}
                        </p>
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid #3C3836' }}>
                          <span style={{ color: '#57534E', fontSize: '0.8rem' }}>📍 {event.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SocietyDetail;
