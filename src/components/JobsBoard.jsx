import React, { useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenApplyModal = (job) => {
    setActiveJobModal(job);
  };

  const handleConfirmApply = async () => {
    if (!activeJobModal) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJobModal.id,
          jobTitle: activeJobModal.title,
          company: activeJobModal.company,
          userEmail: 'architexjobs@gmail.com',
          resumeName: selectedResume
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setAppliedJobs((prev) => [...prev, activeJobModal.id]);
      setActiveJobModal(null);
      alert('Application and resume submitted successfully! Confirmation email dispatched.');
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'inherit', position: 'relative' }}>
      
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main, #fff)' }}>Jobs Marketplace</h1>
          <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Low competition direct pipeline roles with linked projects.</p>
        </div>
        <div style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '800', fontSize: '0.88rem', border: '1px solid rgba(37, 99, 235, 0.4)' }}>
          Applications Submitted: {appliedJobs.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {jobs.map((job) => {
          const hasApplied = appliedJobs.includes(job.id);
          return (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#121214', border: '1px solid #1f2937', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#fff' }}>{job.title}</h2>
                  <div style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#fff' }}>{job.company}</strong> • {job.location} • <span style={{ color: '#3b82f6', fontWeight: '700' }}>{job.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenApplyModal(job)}
                  disabled={hasApplied}
                  style={{
                    backgroundColor: hasApplied ? '#10b981' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    cursor: hasApplied ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hasApplied ? '✓ Applied with Resume' : 'Apply with Resume'}
                </button>
              </div>

              <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{job.description}</p>

              <div style={{ background: '#0b0b0d', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #1f2937', fontSize: '0.85rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: '700' }}>Linked Job Project:</span>{' '}
                <span style={{ color: '#fff' }}>{job.projects[0].name}</span> (Budget: {job.projects[0].budget} • Timeline: {job.projects[0].timeline})
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {job.techStack.map((tech, idx) => (
                  <span key={idx} style={{ background: '#1f2937', color: '#d1d5db', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.78rem', fontWeight: '600' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeJobModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#121214',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            color: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', marginTop: 0 }}>Apply to {activeJobModal.company}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Position: <strong style={{ color: '#fff' }}>{activeJobModal.title}</strong></p>

            <div style={{ marginBottom: '1.5rem', background: '#0b0b0d', padding: '1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#3b82f6', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>Associated Project Scope</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{activeJobModal.projects[0].name}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Fixed Budget: {activeJobModal.projects[0].budget}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: '#d1d5db' }}>
                Select Stored Resume / Profile:
              </label>
              <select 
                value={selectedResume} 
                onChange={(e) => setSelectedResume(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="Primary_Software_Resume.pdf">Primary_Software_Resume.pdf (Backend & Automation)</option>
                <option value="Audio_Engineering_CV.pdf">Audio_Engineering_CV.pdf (Sound Production)</option>
                <option value="FullStack_Custom_Profile.pdf">FullStack_Custom_Profile.pdf</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setActiveJobModal(null)}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #374151',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isSubmitting}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
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
