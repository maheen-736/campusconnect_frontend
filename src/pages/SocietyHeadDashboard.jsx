import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function SocietyHeadDashboard() {
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditSocietyModal, setShowEditSocietyModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ✅ UPDATED: registration_url added
  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_date: '',
    venue: '', capacity: 100, image: null, registration_url: ''
  });

  const [memberForm, setMemberForm] = useState({ name: '', role: '', email: '', photo: null });

  // ✅ UPDATED: social links added
  const [societyForm, setSocietyForm] = useState({
    description: '', tagline: '', founded_at: '',
    cover_image: null,
    instagram: '', facebook: '', linkedin: '',
    tiktok: '', twitter: '', whatsapp: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role_id !== 2) { navigate('/login'); return; }
    fetchSociety();
  }, []);

  const fetchSociety = async () => {
    try {
      const res = await api.get('/my-society');
      setSociety(res.data);
      // ✅ UPDATED: social links fetched
      setSocietyForm({
        description: res.data.description || '',
        tagline: res.data.tagline || '',
        founded_at: res.data.founded_at || '',
        cover_image: null,
        instagram: res.data.instagram || '',
        facebook: res.data.facebook || '',
        linkedin: res.data.linkedin || '',
        tiktok: res.data.tiktok || '',
        twitter: res.data.twitter || '',
        whatsapp: res.data.whatsapp || '',
      });
      setCoverPreview(res.data.cover_image_url || null);
    } catch {
      setError('No society assigned to your account.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(eventForm).forEach(k => {
        if (eventForm[k] !== null && eventForm[k] !== '') fd.append(k, eventForm[k]);
      });
      if (editingEvent) {
        fd.append('_method', 'PUT');
        await api.post(`/events/${editingEvent.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Event updated.');
      } else {
        await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Event created.');
      }
      setShowEventModal(false);
      fetchSociety();
    } catch { notify('Failed to save event.', true); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      notify('Event deleted.');
      fetchSociety();
    } catch { notify('Failed to delete.', true); }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', memberForm.name);
      fd.append('role', memberForm.role);
      if (memberForm.email) fd.append('email', memberForm.email);
      if (memberForm.photo) fd.append('photo', memberForm.photo);
      await api.post('/my-society/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Member added.');
      setShowMemberModal(false);
      setMemberForm({ name: '', role: '', email: '', photo: null });
      setMemberPhotoPreview(null);
      fetchSociety();
    } catch { notify('Failed to add member.', true); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/my-society/members/${memberId}`);
      notify('Member removed.');
      fetchSociety();
    } catch { notify('Failed to remove.', true); }
  };

  const handleSocietyUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      if (societyForm.description) fd.append('description', societyForm.description);
      if (societyForm.tagline) fd.append('tagline', societyForm.tagline);
      if (societyForm.founded_at) fd.append('founded_at', societyForm.founded_at);
      if (societyForm.cover_image) fd.append('cover_image', societyForm.cover_image);
      // ✅ UPDATED: social links append
      ['instagram', 'facebook', 'linkedin', 'tiktok', 'twitter', 'whatsapp'].forEach(field => {
        if (societyForm[field]) fd.append(field, societyForm[field]);
      });
      await api.post('/my-society/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Society updated.');
      setShowEditSocietyModal(false);
      fetchSociety();
    } catch { notify('Failed to update society.', true); }
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

  if (!society) return (
    <>
      <Navbar />
      <div className="container py-5 text-center">
        <div className="card-dark p-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
          <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>No Society Assigned</h4>
          <p className="text-muted-custom">Contact admin to get a society assigned to your account.</p>
        </div>
      </div>
    </>
  );

  const upcoming = society.events?.filter(e => new Date(e.event_date) >= now) || [];
  const past = society.events?.filter(e => new Date(e.event_date) < now) || [];

  return (
    <>
      <Navbar />

      {/* Society Cover */}
      <div style={{
        width: '100%', height: '220px', position: 'relative', overflow: 'hidden',
        background: society.cover_image_url
          ? 'none'
          : 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(247,37,133,0.1))',
        borderBottom: '1px solid #1e1e32'
      }}>
        {society.cover_image_url && (
          <img src={society.cover_image_url} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)'
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'flex-end', padding: '2rem'
        }}>
          <div className="container d-flex justify-content-between align-items-end">
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' }}>
                SOCIETY HEAD PORTAL
              </p>
              <h1 style={{ fontWeight: '900', fontSize: '2rem', marginBottom: '4px' }}>
                {society.name}
              </h1>
              {society.tagline && (
                <p style={{ color: '#6b7280', marginBottom: 0, fontSize: '0.95rem' }}>
                  {society.tagline}
                </p>
              )}
            </div>
            <button className="btn btn-sm" style={{
              border: '1px solid rgba(108,99,255,0.4)', color: '#6c63ff',
              borderRadius: '8px', fontSize: '0.85rem', background: 'rgba(10,10,15,0.6)'
            }} onClick={() => setShowEditSocietyModal(true)}>
              Edit Society
            </button>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {message && <div className="alert-success-custom mb-4">{message}</div>}
        {error && <div className="alert-custom mb-4">{error}</div>}

        {/* Stats */}
        <div className="row g-4 mb-5">
          {[
            { num: society.events?.length || 0, label: 'Total Events', icon: '📋' },
            { num: upcoming.length, label: 'Upcoming', icon: '📅' },
            { num: past.length, label: 'Past Events', icon: '✅' },
            { num: society.members?.length || 0, label: 'Members', icon: '👥' },
          ].map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-number">{s.num}</div>
                <p className="text-muted-custom mb-0 mt-1" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          {[
            { key: 'events', label: `Events (${society.events?.length || 0})` },
            { key: 'members', label: `Members (${society.members?.length || 0})` },
            { key: 'about', label: 'About' },
          ].map(tab => (
            <button key={tab.key} className={`tab-custom ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ fontWeight: '700', marginBottom: 0 }}>Your Events</h5>
              <button className="btn-primary-custom btn px-4 py-2" style={{ fontSize: '0.875rem' }}
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm({ title: '', description: '', event_date: '', venue: '', capacity: 100, image: null, registration_url: '' });
                  setImagePreview(null);
                  setShowEventModal(true);
                }}>
                + Create Event
              </button>
            </div>

            {society.events?.length === 0 ? (
              <div className="card-dark p-5 text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p className="text-muted-custom mb-3">No events created yet.</p>
                <button className="btn-primary-custom btn px-4 py-2"
                  onClick={() => setShowEventModal(true)}>
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="card-dark overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-dark-custom mb-0">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {society.events.map(event => (
                        <tr key={event.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {event.image_url ? (
                                <img src={event.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6c63ff, #f72585)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
                              )}
                              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{event.title}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{formatDate(event.event_date)}</td>
                          <td style={{ fontSize: '0.85rem' }}>{event.venue}</td>
                          <td style={{ fontSize: '0.85rem' }}>{event.capacity}</td>
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
                            <div className="d-flex gap-2">
                              <Link to={`/events/${event.id}`} style={{
                                border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff',
                                borderRadius: '6px', fontSize: '0.78rem', padding: '4px 10px',
                                textDecoration: 'none'
                              }}>
                                View
                              </Link>
                              <button className="btn btn-sm" style={{ border: '1px solid rgba(108,99,255,0.4)', color: '#6c63ff', borderRadius: '6px', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setEditingEvent(event);
                                  setEventForm({
                                    title: event.title,
                                    description: event.description || '',
                                    event_date: event.event_date?.slice(0, 16),
                                    venue: event.venue,
                                    capacity: event.capacity,
                                    image: null,
                                    registration_url: event.registration_url || ''
                                  });
                                  setImagePreview(event.image_url || null);
                                  setShowEventModal(true);
                                }}>
                                Edit
                              </button>
                              <button className="btn btn-sm" style={{ border: '1px solid rgba(247,37,133,0.4)', color: '#f72585', borderRadius: '6px', fontSize: '0.78rem' }}
                                onClick={() => handleDeleteEvent(event.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ fontWeight: '700', marginBottom: 0 }}>Society Members</h5>
              <button className="btn-primary-custom btn px-4 py-2" style={{ fontSize: '0.875rem' }}
                onClick={() => {
                  setMemberForm({ name: '', role: '', email: '', photo: null });
                  setMemberPhotoPreview(null);
                  setShowMemberModal(true);
                }}>
                + Add Member
              </button>
            </div>

            {society.members?.length === 0 ? (
              <div className="card-dark p-5 text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p className="text-muted-custom mb-3">No members added yet.</p>
                <button className="btn-primary-custom btn px-4 py-2"
                  onClick={() => setShowMemberModal(true)}>
                  Add First Member
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {society.members.map(member => (
                  <div className="col-md-4 col-lg-3" key={member.id}>
                    <div style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          objectFit: 'cover', marginBottom: '0.75rem',
                          border: '3px solid rgba(108,99,255,0.2)'
                        }} />
                      ) : (
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6c63ff, #f72585)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem', fontWeight: '700', color: 'white',
                          margin: '0 auto 0.75rem'
                        }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h6 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        {member.name}
                      </h6>
                      <span style={{
                        background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                        color: '#6c63ff', fontSize: '0.7rem', padding: '3px 10px',
                        borderRadius: '20px', fontWeight: '600'
                      }}>
                        {member.role}
                      </span>
                      {member.email && (
                        <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                          {member.email}
                        </p>
                      )}
                      <button onClick={() => handleRemoveMember(member.id)} style={{
                        background: 'rgba(247,37,133,0.08)', border: '1px solid rgba(247,37,133,0.2)',
                        color: '#f72585', borderRadius: '8px', padding: '4px 14px',
                        fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.5rem'
                      }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card-dark p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 style={{ fontWeight: '700', marginBottom: 0 }}>Society Information</h5>
                  <button onClick={() => setShowEditSocietyModal(true)} style={{
                    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                    color: '#6c63ff', borderRadius: '8px', padding: '4px 14px',
                    fontSize: '0.8rem', cursor: 'pointer'
                  }}>
                    Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  {[
                    { label: 'Name', val: society.name },
                    { label: 'Tagline', val: society.tagline || 'Not set' },
                    { label: 'Founded', val: society.founded_at || 'Not set' },
                  ].map((item, i) => (
                    <div key={i} className="d-flex gap-3 py-2"
                      style={{ borderBottom: i < 2 ? '1px solid #1e1e32' : 'none' }}>
                      <span style={{ color: '#6b7280', width: '100px', flexShrink: 0 }}>{item.label}</span>
                      <span style={{ fontWeight: '600' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-dark p-4">
                <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>Description</h5>
                <p style={{ color: '#6b7280', lineHeight: '1.9', fontSize: '0.95rem', marginBottom: 0 }}>
                  {society.description || 'No description added yet. Click Edit Society to add one.'}
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card-dark p-4">
                <h6 style={{ fontWeight: '700', marginBottom: '1rem', color: '#6b7280', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                  PUBLIC PAGE
                </h6>
                <p className="text-muted-custom" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  This is how students see your society page.
                </p>
                <Link to={`/societies/${society.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '0.6rem',
                  border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff',
                  borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600'
                }}>
                  View Public Page →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Event Modal — registration_url added */}
      {showEventModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-700">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEventModal(false)} />
              </div>
              <form onSubmit={handleEventSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>EVENT TITLE</label>
                      <input type="text" className="form-control input-dark" placeholder="Enter event title"
                        value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>DESCRIPTION</label>
                      <textarea className="form-control input-dark" rows="3" placeholder="Describe the event..."
                        value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>DATE & TIME</label>
                      <input type="datetime-local" className="form-control input-dark"
                        value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>VENUE</label>
                      <input type="text" className="form-control input-dark" placeholder="Event venue"
                        value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>CAPACITY</label>
                      <input type="number" className="form-control input-dark"
                        value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: e.target.value })} required />
                    </div>

                    {/* ✅ NEW: Registration URL */}
                    <div className="col-12">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>EXTERNAL REGISTRATION URL (OPTIONAL)</label>
                      <input type="url" className="form-control input-dark"
                        placeholder="https://forms.google.com/..."
                        value={eventForm.registration_url || ''}
                        onChange={e => setEventForm({ ...eventForm, registration_url: e.target.value })} />
                      <p style={{ color: '#57534E', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                        Add a Google Form, MS Form, or any external registration link
                      </p>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>EVENT IMAGE</label>
                      <div className="image-upload-area" onClick={() => document.getElementById('eventImg').click()}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="" style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div>
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📸</div>
                            <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>Click to upload image</p>
                          </div>
                        )}
                      </div>
                      <input id="eventImg" type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => {
                          const f = e.target.files[0];
                          if (f) { setEventForm({ ...eventForm, image: f }); setImagePreview(URL.createObjectURL(f)); }
                        }} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowEventModal(false)} style={{
                    background: 'transparent', border: '1px solid #1e1e32',
                    color: '#6b7280', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary-custom btn px-4 py-2">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-700">Add Member</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMemberModal(false)} />
              </div>
              <form onSubmit={handleMemberSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>FULL NAME</label>
                    <input type="text" className="form-control input-dark" placeholder="Member name"
                      value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>ROLE / POSITION</label>
                    <input type="text" className="form-control input-dark" placeholder="e.g. President, Secretary"
                      value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>EMAIL (Optional)</label>
                    <input type="email" className="form-control input-dark" placeholder="member@numl.edu.pk"
                      value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>PHOTO (Optional)</label>
                    <div className="image-upload-area" onClick={() => document.getElementById('memberImg').click()}>
                      {memberPhotoPreview ? (
                        <img src={memberPhotoPreview} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div>
                          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>👤</div>
                          <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>Click to upload photo</p>
                        </div>
                      )}
                    </div>
                    <input id="memberImg" type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setMemberForm({ ...memberForm, photo: f }); setMemberPhotoPreview(URL.createObjectURL(f)); }
                      }} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowMemberModal(false)} style={{
                    background: 'transparent', border: '1px solid #1e1e32',
                    color: '#6b7280', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary-custom btn px-4 py-2">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Society Modal — social links added */}
      {showEditSocietyModal && (
        <div className="modal show d-block modal-dark" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-700">Edit Society</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditSocietyModal(false)} />
              </div>
              <form onSubmit={handleSocietyUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>TAGLINE</label>
                    <input type="text" className="form-control input-dark" placeholder="e.g. Code. Collaborate. Conquer."
                      value={societyForm.tagline} onChange={e => setSocietyForm({ ...societyForm, tagline: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>FOUNDED</label>
                    <input type="text" className="form-control input-dark" placeholder="e.g. 2021"
                      value={societyForm.founded_at} onChange={e => setSocietyForm({ ...societyForm, founded_at: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>DESCRIPTION</label>
                    <textarea className="form-control input-dark" rows="4" placeholder="Describe your society..."
                      value={societyForm.description} onChange={e => setSocietyForm({ ...societyForm, description: e.target.value })} />
                  </div>

                  {/* ✅ NEW: Social Media Links */}
                  <div className="mb-3">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#78716C', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Social Media Links
                    </label>
                    <div className="row g-2">
                      {[
                        { key: 'instagram', placeholder: 'Instagram URL', icon: '📸' },
                        { key: 'facebook', placeholder: 'Facebook URL', icon: '👥' },
                        { key: 'linkedin', placeholder: 'LinkedIn URL', icon: '💼' },
                        { key: 'tiktok', placeholder: 'TikTok URL', icon: '🎵' },
                        { key: 'twitter', placeholder: 'Twitter/X URL', icon: '🐦' },
                        { key: 'whatsapp', placeholder: 'WhatsApp Group Link', icon: '💬' },
                      ].map(s => (
                        <div className="col-md-6" key={s.key}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>
                              {s.icon}
                            </span>
                            <input type="url" className="form-control input-dark"
                              placeholder={s.placeholder}
                              style={{ paddingLeft: '2.2rem' }}
                              value={societyForm[s.key]}
                              onChange={e => setSocietyForm({ ...societyForm, [s.key]: e.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-muted-custom" style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>COVER IMAGE</label>
                    <div className="image-upload-area" onClick={() => document.getElementById('coverImg').click()}>
                      {coverPreview ? (
                        <img src={coverPreview} alt="" style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div>
                          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🖼️</div>
                          <p className="text-muted-custom mb-0" style={{ fontSize: '0.85rem' }}>Click to upload cover image</p>
                        </div>
                      )}
                    </div>
                    <input id="coverImg" type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setSocietyForm({ ...societyForm, cover_image: f }); setCoverPreview(URL.createObjectURL(f)); }
                      }} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowEditSocietyModal(false)} style={{
                    background: 'transparent', border: '1px solid #1e1e32',
                    color: '#6b7280', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer'
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary-custom btn px-4 py-2">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SocietyHeadDashboard;
