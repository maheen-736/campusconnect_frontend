import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [attendees, setAttendees] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [recapForm, setRecapForm] = useState({ recap: '', recap_image: null });
  const [memberForm, setMemberForm] = useState({ name: '', role: '', email: '', photo: null });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role_id !== 1) { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [eventsRes, societiesRes] = await Promise.all([
        api.get('/events'),
        api.get('/societies')
      ]);
      setEvents(eventsRes.data);
      setSocieties(societiesRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/attendees`);
      setAttendees(res.data);
    } catch { setAttendees([]); }
  };

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleRecapSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('recap', recapForm.recap);
      if (recapForm.recap_image) fd.append('recap_image', recapForm.recap_image);
      await api.post(`/events/${selectedEvent.id}/recap`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('Recap added successfully.');
      setShowRecapModal(false);
      fetchAll();
    } catch { notify('Failed to add recap.', true); }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('role', memberForm.role);
      if (memberForm.email) fd.append('email', memberForm.email);
      if (memberForm.photo) fd.append('photo', memberForm.photo);
      await api.post(`/societies/${selectedSociety.id}/members`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('Member added successfully.');
      setShowMemberModal(false);
      setMemberForm({ name: '', role: '', email: '', photo: null });
      fetchAll();
    } catch { notify('Failed to add member.', true); }
  };

  const handleRemoveMember = async (societyId, memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/societies/${societyId}/members/${memberId}`);
      notify('Member removed.');
      fetchAll();
    } catch { notify('Failed to remove member.', true); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const now = new Date();

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
          <p className="text-muted-custom mb-1" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
            Admin Portal
          </p>
          <h1 className="section-title mb-2">System Control</h1>
          <p className="text-muted-custom mb-0">Manage all events, societies, members, and recaps</p>
        </div>

        {message && <div className="alert-success-custom mb-4">{message}</div>}
        {error && <div className="alert-custom mb-4">{error}</div>}

        <div className="row g-4 mb-5">
          {[
            { num: events.length, label: 'Total Events', icon: '📋' },
            { num: events.filter(e => new Date(e.event_date) >= now).length, label: 'Upcoming', icon: '📅' },
            { num: societies.length, label: 'Societies', icon: '🏛️' },
            { num: societies.reduce((a, s) => a + (s.members?.length || 0), 0), label: 'Total Members', icon: '👥' },
          ].map((s, i) => (
            <div className="col-md-3 col-6" key={i}>
              <div className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-number">{s.num}</div>
                <p className="text-muted-custom mb-0 mt-2" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mb-4">
          {['events', 'societies'].map(tab => (
            <button key={tab} className={`tab-custom ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'events' ? `Events (${events.length})` : `Societies & Members (${societies.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'events' && (
          <div className="card-dark overflow-hidden">
            <div className="table-responsive">
              <table className="table table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Society</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Recap</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted-custom py-5">No events found.</td>
                    </tr>
                  ) : events.map(event => (
                    <tr key={event.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {event.image_url ? (
                            <img src={event.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6c63ff, #f72585)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🎯</div>
                          )}
                          <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{event.title}</span>
                        </div>
                      </td>
                      <td>{event.society && <span className="society-tag">{event.society.name}</span>}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(event.event_date)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{event.venue}</td>
                      <td>
                        <span style={{
                          background: new Date(event.event_date) >= now ? 'rgba(0,212,170,0.1)' : 'rgba(107,114,128,0.1)',
                          color: new Date(event.event_date) >= now ? '#00d4aa' : '#6b7280',
                          border: `1px solid ${new Date(event.event_date) >= now ? 'rgba(0,212,170,0.25)' : 'rgba(107,114,128,0.2)'}`,
                          padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600'
                        }}>
                          {new Date(event.event_date) >= now ? 'Upcoming' : 'Past'}
                        </span>
                      </td>
                      <td>
                        {event.recap ? (
                          <span style={{ color: '#00d4aa', fontSize: '0.8rem', fontWeight: '600' }}>Added</span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm" style={{ border: '1px solid rgba(108,99,255,0.4)', color: '#6c63ff', borderRadius: '6px', fontSize: '0.78rem' }}
                            onClick={async () => {
                              setSelectedEvent(event);
                              await fetchAttendees(event.id);
                              setShowAttendeesModal(true);
                            }}>
                            Students
                          </button>
                          {new Date(event.event_date) < now && (
                            <button className="btn btn-sm" style={{ border: '1px solid rgba(247,37,133,0.4)', color: '#f72585', borderRadius: '6px', fontSize: '0.78rem' }}
                              onClick={() => {
                                setSelectedEvent(event);
                                setRecapForm({ recap: event.recap || '', recap_image: null });
                                setShowRecapModal(true);
                              }}>
                              {event.recap ? 'Edit Recap' : 'Add Recap'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'societies' && (
          <div className="row g-4">
            {societies.map(society => (
              <div className="col-12" key={society.id}>
                <div className="card-dark p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h5 style={{ fontWeight: '700', marginBottom: '4px' }}>{society.name}</h5>
                      <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>
                        {society.members?.length || 0} members
                      </p>
                    </div>
                    <button className="btn-primary-custom btn px-3 py-2" style={{ fontSize: '0.85rem' }}
                      onClick={() => {
                        setSelectedSociety(society);
                        setMemberForm({ name: '', role: '', email: '', photo: null });
                        setShowMemberModal(true);
                      }}>
                      + Add Member
                    </button>
                  </div>

                  {society.members?.length === 0 ? (
                    <p className="text-muted-custom" style={{ fontSize: '0.875rem' }}>No members yet.</p>
                  ) : (
                    <div className="row g-3">
                      {society.members.map(member => (
                        <div className="col-md-4 col-lg-3" key={member.id}>
                          <div style={{
                            background: 'rgba(108,99,255,0.05)',
                            border: '1px solid #1e1e32',
                            borderRadius: '12px', padding: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                          }}>
                            {member.photo_url ? (
                              <img src={member.photo_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6c63ff, #f72585)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem', fontWeight: '700', color: 'white', flexShrink: 0
                              }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {member.name}
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{member.role}</div>
                            </div>
                            <button onClick={() => handleRemoveMember(society.id, member.id)}
                              style={{ background: 'none', border: 'none', color: '#f72585', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-700 mb-0">Registered Students</h5>
                  <p className="text-muted-custom mb-0" style={{ fontSize: '0.8rem' }}>{selectedEvent?.title}</p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAttendeesModal(false)} />
              </div>
              <div className="modal-body">
                {attendees.length === 0 ? (
                  <p className="text-muted-custom text-center py-3 mb-0">No students registered yet.</p>
                ) : attendees.map(reg => (
                  <div key={reg.id} className="d-flex align-items-center gap-3 mb-3 p-3"
                    style={{ background: 'rgba(108,99,255,0.05)', borderRadius: '10px', border: '1px solid #1e1e32' }}>
                    <div className="attendees-avatar">{reg.user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="flex-grow-1">
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{reg.user?.name}</div>
                      <div className="text-muted-custom" style={{ fontSize: '0.78rem' }}>{reg.user?.email}</div>
                    </div>
                    <span style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600' }}>
                      Registered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recap Modal */}
      {showRecapModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-700 mb-0">Event Recap</h5>
                  <p className="text-muted-custom mb-0" style={{ fontSize: '0.8rem' }}>{selectedEvent?.title}</p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRecapModal(false)} />
              </div>
              <form onSubmit={handleRecapSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      RECAP DESCRIPTION
                    </label>
                    <textarea className="form-control input-dark" rows="5"
                      placeholder="Write a detailed recap of the event..."
                      value={recapForm.recap}
                      onChange={e => setRecapForm({ ...recapForm, recap: e.target.value })}
                      required />
                  </div>
                  <div>
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      RECAP IMAGE (Optional)
                    </label>
                    <div className="image-upload-area" onClick={() => document.getElementById('recapImg').click()}>
                      {recapForm.recap_image ? (
                        <img src={URL.createObjectURL(recapForm.recap_image)} alt=""
                          style={{ maxHeight: '120px', borderRadius: '8px' }} />
                      ) : selectedEvent?.recap_image_url ? (
                        <img src={selectedEvent.recap_image_url} alt=""
                          style={{ maxHeight: '120px', borderRadius: '8px' }} />
                      ) : (
                        <div>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
                          <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input id="recapImg" type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => setRecapForm({ ...recapForm, recap_image: e.target.files[0] })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowRecapModal(false)} style={{
                    background: 'transparent', border: '1px solid #1e1e32',
                    color: '#6b7280', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary-custom btn px-4 py-2">
                    Save Recap
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-700 mb-0">Add Member</h5>
                  <p className="text-muted-custom mb-0" style={{ fontSize: '0.8rem' }}>{selectedSociety?.name}</p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMemberModal(false)} />
              </div>
              <form onSubmit={handleMemberSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      FULL NAME
                    </label>
                    <input type="text" className="form-control input-dark" placeholder="Member name"
                      value={memberForm.name}
                      onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      ROLE / POSITION
                    </label>
                    <input type="text" className="form-control input-dark" placeholder="e.g. President, Secretary"
                      value={memberForm.role}
                      onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      EMAIL (Optional)
                    </label>
                    <input type="email" className="form-control input-dark" placeholder="member@numl.edu.pk"
                      value={memberForm.email}
                      onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                      PHOTO (Optional)
                    </label>
                    <div className="image-upload-area" onClick={() => document.getElementById('memberPhoto').click()}>
                      {memberForm.photo ? (
                        <img src={URL.createObjectURL(memberForm.photo)} alt=""
                          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                          <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>Click to upload photo</p>
                        </div>
                      )}
                    </div>
                    <input id="memberPhoto" type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => setMemberForm({ ...memberForm, photo: e.target.files[0] })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowMemberModal(false)} style={{
                    background: 'transparent', border: '1px solid #1e1e32',
                    color: '#6b7280', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary-custom btn px-4 py-2">
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;