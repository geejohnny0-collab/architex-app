import React, { useState } from 'react';
import { Layers, Upload, FileText, CheckCircle2, X, Briefcase, Send, Check } from 'lucide-react';

export default function JobsBoard() {
  const [jobs] = useState([
    {
      id: 'job-1',
      title: 'Senior Backend Engineer',
      company: 'Architex Systems',
      location: 'Remote (US/TX)',
      type: 'Full-Time W2',
      description: 'Build high-throughput data pipelines, custom APIs, and backend architectures.',
      techStack: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
      projects: [{ name: 'API Gateway Scaling', budget: '$5,000', timeline: '2 Weeks' }]
    },
    {
      id: 'job-2',
      title: 'Automation & Scraping Engineer',
      company: 'DataFlow Metrics',
      location: 'Remote',
      type: 'Contract-to-Hire',
      description: 'Develop autonomous market scrapers, lead generation scripts, and multi-platform sync tools.',
      techStack: ['Python', 'Selenium', 'BeautifulSoup'],
      projects: [{ name: 'E-commerce Feed Scraper', budget: '$3,200', timeline: '1 Week' }]
    }
  ]);

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [activeJobModal, setActiveJobModal] = useState(null);
  const [selectedResume, setSelectedResume] = useState('Primary_Software_Resume.pdf');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenApplyModal = (job) => {
    setActiveJobModal(job);
    setUploadedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedResume(file.name);
    }
  };

  const handleConfirmApply = async () => {
    if (!activeJobModal) return;
    setIsSubmitting(true);

    try {
      const resumeNameToSubmit = uploadedFile ? uploadedFile.name : selectedResume;

      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJobModal.id,
          jobTitle: activeJobModal.title,
          company: activeJobModal.company,
          userEmail: 'architexjobs@gmail.com',
          resumeName: resumeNameToSubmit
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setAppliedJobs((prev) => [...prev, activeJobModal.id]);
      setActiveJobModal(null);
      alert(`Application and resume (${resumeNameToSubmit}) submitted successfully! Confirmation email dispatched.`);
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'inherit', position: 'relative' }}>
      
      {/* Header Section */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Jobs Marketplace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Low competition direct pipeline roles with linked projects.</p>
        </div>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '0.88rem' }}>
          Applications Submitted: {appliedJobs.length}
        </div>
      </div>

      {/* Jobs List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {jobs.map((job) => {
          const hasApplied = appliedJobs.includes(job.id);
          return (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>{job.title}</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{job.company}</strong> • {job.location} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{job.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenApplyModal(job)}
                  disabled={hasApplied}
                  className={hasApplied ? 'btn-secondary' : 'btn-primary'}
                  style={{
                    padding: '0.6rem 1.25rem',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    cursor: hasApplied ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {hasApplied ? <><Check size={16} /> Applied with Resume</> : <><Send size={16} /> Apply with Resume</>}
                </button>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{job.description}</p>

              {/* Linked Projects Preview Box */}
              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Linked Job Project:</span>{' '}
                <span style={{ color: 'var(--text-main)' }}>{job.projects[0].name}</span> (Budget: {job.projects[0].budget} • Timeline: {job.projects[0].timeline})
              </div>

              {/* Tech Stack Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {job.techStack.map((tech, idx) => (
                  <span key={idx} style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.78rem', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE APPLICATION MODAL OVERLAY */}
      {activeJobModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Apply to {activeJobModal.company}
              </h2>
              <button onClick={() => setActiveJobModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Position: <strong style={{ color: 'var(--text-main)' }}>{activeJobModal.title}</strong>
              </div>

              {/* Linked Projects Inside Modal */}
              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Associated Project Scope
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {activeJobModal.projects[0].name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Fixed Budget: {activeJobModal.projects[0].budget} • Timeline: {activeJobModal.projects[0].timeline}
                </div>
              </div>

              {/* Upload Resume File Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Upload Resume Document (PDF / DOCX):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label
                    htmlFor="resume-file-input"
                    className="btn-secondary"
                    style={{
                      padding: '0.55rem 1rem',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={16} /> Choose File
                  </label>
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '0.84rem', color: uploadedFile ? 'var(--primary)' : 'var(--text-muted)', fontWeight: uploadedFile ? '700' : '400' }}>
                    {uploadedFile ? `📄 ${uploadedFile.name}` : 'No new file chosen'}
                  </span>
                </div>
              </div>

              {/* Stored Resume Selector Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Or Select Stored Profile Resume:
                </label>
                <select 
                  value={selectedResume} 
                  onChange={(e) => {
                    setSelectedResume(e.target.value);
                    setUploadedFile(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Primary_Software_Resume.pdf">Primary_Software_Resume.pdf (Backend & Automation)</option>
                  <option value="Audio_Engineering_CV.pdf">Audio_Engineering_CV.pdf (Sound Production)</option>
                  <option value="FullStack_Custom_Profile.pdf">FullStack_Custom_Profile.pdf</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setActiveJobModal(null)}
                disabled={isSubmitting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Submitting & Dispatching Email...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
