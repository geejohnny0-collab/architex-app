import React, { useState } from 'react';
import { 
  Layers, MapPin, DollarSign, Briefcase, Send, Search, 
  CheckCircle2, Building2, BadgeCheck, Sparkles, Plus, 
  X, Bookmark, Check, UserCheck, ShieldCheck
} from 'lucide-react';

export default function JobsView() {
  const [jobs, setJobs] = useState([]);

  const [activeTab, setActiveTab] = useState('ALL_JOBS');
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [myApplications, setMyApplications] = useState([]);

  // Modals
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [jobDetailDrawer, setJobDetailDrawer] = useState(null);

  // Apply Form State
  const [applyRate, setApplyRate] = useState('');
  const [applyType, setApplyType] = useState('C2H');
  const [applyPitch, setApplyPitch] = useState('');

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newWorkType, setNewWorkType] = useState('Contract to Hire (C2H) & W2');
  const [newC2hRate, setNewC2hRate] = useState('');
  const [newSalaryW2, setNewSalaryW2] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSkills, setNewSkills] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newHiringManager, setNewHiringManager] = useState('');

  const toggleSaveJob = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, saved: !j.saved } : j));
  };

  const handleQuickApplySubmit = (e) => {
    e.preventDefault();
    if (!applyModalJob) return;

    const applicationObj = {
      id: 'app_' + Date.now(),
      jobId: applyModalJob.id,
      title: applyModalJob.title,
      company: applyModalJob.company,
      applyType,
      applyRate: applyRate || (applyType === 'C2H' ? applyModalJob.c2hRate : applyModalJob.salaryW2),
      pitch: applyPitch,
      appliedAt: 'Just now',
      status: 'Under Review',
      statusColor: 'var(--primary)'
    };

    setMyApplications([applicationObj, ...myApplications]);
    setJobs(jobs.map(j => j.id === applyModalJob.id ? { ...j, applied: true } : j));
    setApplyModalJob(null);
    setApplyPitch('');
    setApplyRate('');
  };

  const handlePostJobSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const newJobObj = {
      id: 'j_' + Date.now(),
      title: newTitle.trim(),
      company: newCompany.trim(),
      logo: null,
      workType: newWorkType,
      c2hRate: newC2hRate.trim() || null,
      salaryW2: newSalaryW2.trim() || null,
      location: newLocation.trim() || 'Remote',
      posted: 'Just now',
      category: newWorkType.includes('CTO') || newWorkType.includes('Executive') ? 'CTO' : 'DEV',
      skills: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      hiringManager: newHiringManager.trim() || 'Hiring Manager',
      description: newDescription.trim(),
      applied: false,
      saved: false
    };

    setJobs([newJobObj, ...jobs]);
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setNewSkills('');
    setNewC2hRate('');
    setNewSalaryW2('');
    setNewHiringManager('');
    setIsPostJobModalOpen(false);
  };

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q));

    const matchesFilter = roleTypeFilter === 'ALL' ||
      (roleTypeFilter === 'C2H' && j.workType.includes('C2H')) ||
      (roleTypeFilter === 'W2' && j.workType.includes('W2')) ||
      (roleTypeFilter === 'CTO' && j.category === 'CTO');

    return matchesQuery && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: 0 }}>
            <Layers size={24} style={{ color: 'var(--primary)' }} /> Jobs Board
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            Contract-to-Hire (C2H), Full-Time W2, and Fractional roles posted by real businesses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'ALL_JOBS' ? 'MY_APPLICATIONS' : 'ALL_JOBS')}
            className={activeTab === 'MY_APPLICATIONS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserCheck size={16} /> My Applications ({myApplications.length})
          </button>

          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px var(--primary-glow)' }}
          >
            <Plus size={16} /> Post a Job
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      {activeTab === 'ALL_JOBS' && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, company, or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 2.5rem 0.65rem 2.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Filter:</span>
            {[
              { id: 'ALL', label: 'All Jobs' },
              { id: 'C2H', label: 'Contract to Hire' },
              { id: 'W2', label: 'Full-Time W2' },
              { id: 'CTO', label: 'Leadership / CTO' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setRoleTypeFilter(pill.id)}
                style={{
                  padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '600',
                  border: '1px solid', cursor: 'pointer',
                  borderColor: roleTypeFilter === pill.id ? 'var(--primary)' : 'var(--border-color)',
                  background: roleTypeFilter === pill.id ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: roleTypeFilter === pill.id ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* JOB LISTINGS or APPLICATIONS */}
      {activeTab === 'ALL_JOBS' ? (
        filteredJobs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px' }}>
                {searchQuery || roleTypeFilter !== 'ALL' ? 'No matching jobs found' : 'No jobs posted yet'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
                {searchQuery || roleTypeFilter !== 'ALL'
                  ? 'Try adjusting your search or filter.'
                  : 'Be the first to post a job — click "Post a Job" to list a real opportunity for developers and engineers.'}
              </p>
            </div>
            {!searchQuery && roleTypeFilter === 'ALL' && (
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={18} /> Post First Job
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredJobs.map((job) => (
              <div key={job.id} className="glass-panel" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {job.logo
                      ? <img src={job.logo} alt={job.company} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                      : <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0 }}>{(job.company || 'J')[0].toUpperCase()}</div>
                    }
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 onClick={() => setJobDetailDrawer(job)} style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, cursor: 'pointer' }}>
                          {job.title}
                        </h2>
                        <span className="badge badge-primary">{job.workType}</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{job.company}</strong>
                        {job.location && <> • <MapPin size={13} style={{ display: 'inline', margin: '0 2px' }} />{job.location}</>}
                        {job.posted && <> • Posted {job.posted}</>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    style={{ background: 'none', border: 'none', color: job.saved ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700' }}
                  >
                    <Bookmark size={16} fill={job.saved ? 'var(--primary)' : 'none'} /> {job.saved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {job.description && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{job.description}</p>
                )}

                {job.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.skills.map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '0.76rem', background: 'var(--bg-surface-hover)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: '16px', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Compensation + Actions */}
                <div style={{ background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    {job.c2hRate && (
                      <>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>C2H Rate</span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-green)' }}>{job.c2hRate}</span>
                      </>
                    )}
                    {job.salaryW2 && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: job.c2hRate ? '10px' : 0 }}>
                        {job.c2hRate ? 'W2: ' : ''}{job.salaryW2}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setJobDetailDrawer(job)} className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                      View Details
                    </button>
                    <button
                      disabled={job.applied}
                      onClick={() => setApplyModalJob(job)}
                      className="btn-primary"
                      style={{ padding: '0.45rem 1.15rem', fontSize: '0.82rem', opacity: job.applied ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {job.applied ? <><Check size={14} /> Applied</> : <><Send size={14} /> Apply</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* MY APPLICATIONS */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myApplications.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <UserCheck size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>No applications yet</h3>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Apply to jobs to track your submissions here.</p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div key={app.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: app.statusColor, fontWeight: '800', marginBottom: '4px' }}>
                    {app.status}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{app.title}</h3>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {app.company} • {app.applyType}{app.applyRate && ` (${app.applyRate})`} • {app.appliedAt}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* APPLY MODAL */}
      {applyModalJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Send size={18} style={{ color: 'var(--primary)' }} /> Apply to Job
              </h2>
              <button onClick={() => setApplyModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickApplySubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>{applyModalJob.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{applyModalJob.company}{applyModalJob.c2hRate && ` • ${applyModalJob.c2hRate}`}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Work Agreement:</label>
                  <select
                    value={applyType}
                    onChange={(e) => setApplyType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}
                  >
                    <option value="C2H">Contract to Hire (C2H)</option>
                    <option value="W2">Full-Time W2</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Your Desired Rate / Compensation:</label>
                  <input
                    type="text"
                    placeholder={applyType === 'C2H' ? 'e.g. $130/hr' : 'e.g. $200,000/yr'}
                    value={applyRate}
                    onChange={(e) => setApplyRate(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Quick Pitch:</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state why your background matches this role..."
                    value={applyPitch}
                    onChange={(e) => setApplyPitch(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setApplyModalJob(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST JOB MODAL */}
      {isPostJobModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Plus size={18} style={{ color: 'var(--primary)' }} /> Post a Job
              </h2>
              <button onClick={() => setIsPostJobModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Job Title *</label>
                  <input type="text" required placeholder="e.g. Senior Full-Stack Engineer" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Company *</label>
                    <input type="text" required placeholder="Company name" value={newCompany} onChange={(e) => setNewCompany(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Agreement Type</label>
                    <select value={newWorkType} onChange={(e) => setNewWorkType(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}>
                      <option>Contract to Hire (C2H) & W2</option>
                      <option>Full-Time W2</option>
                      <option>Fractional Executive Retainer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>C2H Hourly Rate</label>
                    <input type="text" placeholder="e.g. $120 - $140/hr" value={newC2hRate} onChange={(e) => setNewC2hRate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>W2 Salary</label>
                    <input type="text" placeholder="e.g. $195,000/yr" value={newSalaryW2} onChange={(e) => setNewSalaryW2(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Location</label>
                    <input type="text" placeholder="e.g. Remote, New York" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Hiring Manager</label>
                    <input type="text" placeholder="Your name & title" value={newHiringManager} onChange={(e) => setNewHiringManager(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Tech Stack (comma separated)</label>
                  <input type="text" placeholder="e.g. React, TypeScript, Node.js, AWS" value={newSkills} onChange={(e) => setNewSkills(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Job Description *</label>
                  <textarea rows={4} required placeholder="Describe the role, responsibilities, and requirements..."
                    value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box', resize: 'none' }} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsPostJobModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOB DETAIL DRAWER */}
      {jobDetailDrawer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{jobDetailDrawer.workType}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-main)' }}>{jobDetailDrawer.title}</h2>
              </div>
              <button onClick={() => setJobDetailDrawer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {jobDetailDrawer.logo
                  ? <img src={jobDetailDrawer.logo} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }} />
                  : <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '1.3rem' }}>{(jobDetailDrawer.company || 'J')[0].toUpperCase()}</div>
                }
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{jobDetailDrawer.company}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{jobDetailDrawer.location} • Posted {jobDetailDrawer.posted}</div>
                </div>
              </div>

              {jobDetailDrawer.hiringManager && (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Hiring Lead</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{jobDetailDrawer.hiringManager}</div>
                </div>
              )}

              {jobDetailDrawer.description && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Role Description</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{jobDetailDrawer.description}</p>
                </div>
              )}

              {jobDetailDrawer.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Tech Stack Required</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {jobDetailDrawer.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', background: 'var(--bg-surface-hover)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontWeight: '700', border: '1px solid var(--border-color)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setJobDetailDrawer(null)} className="btn-secondary">Close</button>
              <button
                onClick={() => { setApplyModalJob(jobDetailDrawer); setJobDetailDrawer(null); }}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} /> Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
