import React, { useState } from 'react';

export default function JobsBoard() {
  // 1. State for mock jobs displayed on the board
  const [jobs] = useState([
    {
      id: 'job-1',
      title: 'Senior Backend Engineer',
      company: 'Architex Systems',
      location: 'Remote',
      type: 'Full-Time W2',
      description: 'Build high-throughput data pipelines, custom APIs, and backend architectures.',
      techStack: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
      projects: [{ name: 'API Gateway Scaling', budget: '$5,000' }]
    },
    {
      id: 'job-2',
      title: 'Automation & Scraping Engineer',
      company: 'DataFlow Metrics',
      location: 'Remote (US/TX)',
      type: 'Contract-to-Hire',
      description: 'Develop autonomous market scrapers, lead generation scripts, and multi-platform sync tools.',
      techStack: ['Python', 'Selenium', 'BeautifulSoup'],
      projects: [{ name: 'E-commerce Feed Scraper', budget: '$3,200' }]
    }
  ]);

  // 2. State to track user's applied jobs
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Handler function executed when user clicks "Apply with Resume"
  const handleApplyWithResume = async (job) => {
    setIsSubmitting(true);
    try {
      // Fire POST request to our backend API route
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          userEmail: 'architexjobs@gmail.com'
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedJobs((prev) => [...prev, job.id]);
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Jobs Marketplace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: '4px 0 0 0' }}>Apply directly with your stored resume profile.</p>
        </div>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '0.88rem' }}>
          Applications Submitted: {appliedJobs.length}
        </div>
      </div>

      {/* Jobs List */}
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
                  onClick={() => handleApplyWithResume(job)}
                  disabled={hasApplied || isSubmitting}
                  style={{
                    backgroundColor: hasApplied ? '#10b981' : 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    cursor: hasApplied || isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hasApplied ? '✓ Applied with Resume' : isSubmitting ? 'Submitting...' : 'Apply with Resume'}
                </button>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{job.description}</p>

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
    </div>
  );
}
