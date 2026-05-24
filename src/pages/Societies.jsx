import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Societies() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/societies').then(r => {
      setSocieties(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const scColors = ['#F97316','#EF4444','#F59E0B','#8B5CF6','#06B6D4','#10B981'];
  const scIcons = ['💻','🎬','🚀','🧠','📖','⚽'];

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="hero-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="section-title mb-2">Our Societies</h1>
              <p style={{ color: '#A8A29E', marginBottom: 0 }}>
                Six communities. One campus. Find where you belong and make your mark.
              </p>
            </div>
            <div className="col-lg-4 mt-3 mt-lg-0 d-flex justify-content-lg-end">
              <div style={{
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '16px', padding: '1rem 1.5rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#F97316' }}>
                  {societies.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#A8A29E', fontWeight: '600' }}>
                  Active Societies
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#F97316' }} role="status" />
          </div>
        ) : (
          <div className="row g-4">
            {societies.map((s, i) => {
              const now = new Date();
              const upcomingCount = s.events?.filter(e => new Date(e.event_date) >= now).length || 0;
              const pastCount = s.events?.filter(e => new Date(e.event_date) < now).length || 0;
              const ac = scColors[i % scColors.length];

              return (
                <div className="col-md-6 col-lg-4" key={s.id}>
                  <Link to={`/societies/${s.id}`} style={{ textDecoration: 'none' }}>
                    <div className="event-card p-4 h-100" style={{ borderTop: `3px solid ${ac}` }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        {s.cover_image_url ? (
                          <img src={s.cover_image_url} alt={s.name} style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            objectFit: 'cover', flexShrink: 0
                          }} />
                        ) : (
                          <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: `${ac}18`, border: `1px solid ${ac}30`,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
                          }}>
                            {scIcons[i % scIcons.length]}
                          </div>
                        )}
                        <div>
                          <h5 style={{ fontWeight: '800', fontSize: '0.95rem', color: '#FFF7ED', marginBottom: '2px' }}>
                            {s.name}
                          </h5>
                          {s.tagline && (
                            <p style={{ color: ac, fontSize: '0.72rem', fontWeight: '600', marginBottom: 0 }}>
                              {s.tagline}
                            </p>
                          )}
                          {s.founded_at && (
                            <p style={{ color: '#57534E', fontSize: '0.7rem', marginBottom: 0 }}>
                              Est. {s.founded_at}
                            </p>
                          )}
                        </div>
                      </div>

                      <p style={{ color: '#A8A29E', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                        {s.description?.slice(0, 110)}...
                      </p>

                      <div className="d-flex gap-2 mb-4">
                        <div style={{
                          background: `${ac}12`, border: `1px solid ${ac}20`,
                          borderRadius: '10px', padding: '0.5rem 0.75rem',
                          textAlign: 'center', flex: 1
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: ac }}>{upcomingCount}</div>
                          <div style={{ fontSize: '0.68rem', color: '#57534E', fontWeight: '600' }}>Upcoming</div>
                        </div>
                        <div style={{
                          background: 'rgba(168,162,158,0.06)', border: '1px solid rgba(168,162,158,0.12)',
                          borderRadius: '10px', padding: '0.5rem 0.75rem',
                          textAlign: 'center', flex: 1
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#A8A29E' }}>{pastCount}</div>
                          <div style={{ fontSize: '0.68rem', color: '#57534E', fontWeight: '600' }}>Past Events</div>
                        </div>
                        <div style={{
                          background: 'rgba(168,162,158,0.06)', border: '1px solid rgba(168,162,158,0.12)',
                          borderRadius: '10px', padding: '0.5rem 0.75rem',
                          textAlign: 'center', flex: 1
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#A8A29E' }}>{s.members?.length || 0}</div>
                          <div style={{ fontSize: '0.68rem', color: '#57534E', fontWeight: '600' }}>Members</div>
                        </div>
                      </div>

                      <div style={{
                        background: `${ac}10`, border: `1px solid ${ac}20`,
                        borderRadius: '10px', padding: '0.6rem',
                        textAlign: 'center', color: ac,
                        fontWeight: '700', fontSize: '0.85rem'
                      }}>
                        Explore Society →
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Societies;