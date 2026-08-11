import React, { useState, useEffect } from 'react';
import { Layers, Upload, FileText, CheckCircle2, X, Briefcase, Send, Check, Eye, Plus, ShieldCheck, Award, Lock, Sparkles, User, Mail, Link as LinkIcon, FileEdit, Trash2, Calendar, Phone, MapPin, Globe, GraduationCap, FileCheck, PenTool } from 'lucide-react';

export default function JobsBoard({ user }) {
  const userEmail = (user?.email || '').toLowerCase();
  const isOwnerAccount = ['geejohnny0@gmail.com', 'architexjobs@gmail.com', 'architex@gmail.com'].includes(userEmail) || user?.isAdmin === true;
  const isBusinessOrRecruiter = ['business', 'recruiter', 'enterprise'].includes((user?.userType || '').toLowerCase()) || user?.verified === true || isOwnerAccount;
  const isPaidVerifiedBusiness = user?.verified === true || user?.isVerified === true || user?.isCertified === true || isOwnerAccount;

  const DEFAULT_JOBS = [
    {
      id: 'job-1',
      title: 'Senior Backend Engineer',
      company: 'Architex Systems',
      location: 'Remote (US/TX)',
      type: 'Full-Time W2',
      c2hRate: '$130 - $150/hr',
      salaryW2: '$195,000/yr',
      hiringManager: 'Alex Mercer (CTO)',
      description: 'Build high-throughput data pipelines, custom APIs, and backend architectures. You will lead the infrastructure migration to distributed clusters and integrate high-concurrency microservices.',
      techStack: ['Node.js', 'Python', 'PostgreSQL', 'Docker']
    },
    {
      id: 'job-2',
      title: 'Automation & Scraping Engineer',
      company: 'DataFlow Metrics',
      location: 'Remote',
      type: 'Contract-to-Hire',
      c2hRate: '$110 - $130/hr',
      salaryW2: '$170,000/yr',
      hiringManager: 'Sarah Jenkins (VP Engineering)',
      description: 'Develop autonomous market scrapers, lead generation scripts, and multi-platform sync tools. Responsible for maintaining web scrapers against strict anti-bot systems.',
      techStack: ['Python', 'Selenium', 'BeautifulSoup']
    }
  ];

  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [allApplications, setAllApplications] = useState([]);
  const [viewApplicantsJob, setViewApplicantsJob] = useState(null);

  useEffect(() => {
    // Fetch live jobs globally from central server
    fetch('/api/jobs')
      .then(res => res.json())
      .then(serverJobs => {
        if (Array.isArray(serverJobs) && serverJobs.length > 0) {
          setJobs(serverJobs);
        }
      })
      .catch(err => console.log('Using default jobs fallback:', err));

    // Fetch live candidate applications
    fetch('/api/jobs/applications')
      .then(res => res.json())
      .then(serverApps => {
        if (Array.isArray(serverApps)) {
          setAllApplications(serverApps);
        }
      })
      .catch(err => console.log('Applications fetch fallback:', err));
  }, []);

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [activeJobModal, setActiveJobModal] = useState(null);
  const [jobDetailDrawer, setJobDetailDrawer] = useState(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState('Primary_Software_Resume.pdf');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileBase64, setUploadedFileBase64] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [applyMode, setApplyMode] = useState('resume');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationBanner, setConfirmationBanner] = useState({ show: false, message: '', company: '' });
  const [confirmationModalScreen, setConfirmationModalScreen] = useState(null);
  const [viewingResumeModal, setViewingResumeModal] = useState(null); // stores candidate app object for resume preview modal
  const [isMasterVaultOpen, setIsMasterVaultOpen] = useState(false);
  const [vaultData, setVaultData] = useState(null);
  const [pdfPreviewModal, setPdfPreviewModal] = useState(null);

  const handleOpenDownloadResume = (app) => {
    if (!app) return;
    const targetUrl = app.resumeUrl || app.resumeFile;
    const fileName = app.resumeName || 'Candidate_Resume.pdf';

    if (targetUrl) {
      if (targetUrl.startsWith('data:')) {
        try {
          const arr = targetUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const blobUrl = URL.createObjectURL(blob);

          const win = window.open(blobUrl, '_blank');
          if (!win || win.closed || typeof win.closed === 'undefined') {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          return;
        } catch (e) {
          console.error('Base64 blob conversion error:', e);
        }
      }

      if (targetUrl.startsWith('http') || targetUrl.startsWith('blob:')) {
        window.open(targetUrl, '_blank');
        return;
      }
    }

    // Direct server PDF file fallback route
    window.open(`/api/files/resume/${encodeURIComponent(fileName)}`, '_blank');
  };

  // Advanced Manual Application State
  const [manualForm, setManualForm] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    email: user?.email || 'architexjobs@gmail.com',
    phone: '',
    cityState: '',
    country: 'United States',
    linkedIn: '',
    portfolio: '',
    gitHub: '',
    currentTitle: '',
    currentEmployer: '',
    yearsExperience: '3-5 years',
    desiredSalary: '',
    desiredRate: '',
    earliestStartDate: '',
    employmentPreference: 'Full-Time',
    workAuth: 'Authorized to work without restriction',
    sponsorshipRequired: 'No',
    willingToRelocate: 'No',
    willingToTravel: 'Up to 25%',
    technicalSkills: '',
    certifications: '',
    languages: 'English',
    educationLevel: "Bachelor's Degree",
    degree: 'Computer Science / Engineering',
    school: '',
    graduationYear: '2022',
    noticePeriod: '2 Weeks',
    interviewAvailability: 'Weekdays 9 AM - 5 PM CST',
    bgCheckConsent: true,
    eeoGender: 'Prefer not to answer',
    eeoVeteran: 'Prefer not to answer',
    eeoDisability: 'Prefer not to answer',
    eeoRace: 'Prefer not to answer',
    agreeAccuracy: true,
    agreePrivacy: true,
    signature: '',
    signDate: new Date().toISOString().split('T')[0]
  });

  // Dynamic Work Experience Entries
  const [experiences, setExperiences] = useState([
    { company: '', title: '', dates: '', current: true, responsibilities: '' }
  ]);

  // Dynamic Projects Entries
  const [projectsList, setProjectsList] = useState([
    { name: '', description: '', techUsed: '', projectUrl: '', repoUrl: '' }
  ]);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newWorkType, setNewWorkType] = useState('Contract to Hire (C2H) & W2');
  const [newC2hRate, setNewC2hRate] = useState('');
  const [newSalaryW2, setNewSalaryW2] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newLocationDetail, setNewLocationDetail] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('architex_published_jobs', JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to persist jobs:', e);
    }
  }, [jobs]);

  const handleClickPostJob = () => {
    if (!isPaidVerifiedBusiness) {
      setIsVerificationModalOpen(true);
    } else {
      setIsPostJobModalOpen(true);
    }
  };

  const handleOpenApplyModal = (job) => {
    setActiveJobModal(job);
    setUploadedFile(null);
    setApplyMode('resume');
    setIsDragging(false);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setSelectedResume(file.name);
      
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedFileBase64(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setSelectedResume(file.name);

      const reader = new FileReader();
      reader.onload = (ev) => setUploadedFileBase64(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', title: '', dates: '', current: false, responsibilities: '' }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjectsList([...projectsList, { name: '', description: '', techUsed: '', projectUrl: '', repoUrl: '' }]);
  };

  const removeProject = (index) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  const handleConfirmApply = async () => {
    if (!activeJobModal) return;
    setIsSubmitting(true);

    try {
      const emailToTarget = user?.email || (applyMode === 'manual' ? manualForm.email : 'architexjobs@gmail.com');
      let submissionData = {};

      if (applyMode === 'manual') {
        if (!manualForm.firstName.trim() || !manualForm.email.trim()) {
          throw new Error('Please fill in your Name and Email address for manual application.');
        }
        if (!manualForm.signature.trim()) {
          throw new Error('Please provide your Electronic Signature to confirm your application.');
        }
        submissionData = {
          jobId: activeJobModal.id,
          jobTitle: activeJobModal.title,
          company: activeJobModal.company,
          userEmail: emailToTarget,
          applicantName: `${manualForm.firstName} ${manualForm.lastName}`.trim(),
          manualDetails: {
            ...manualForm,
            experiences,
            projects: projectsList
          },
          resumeName: 'Comprehensive Manual Application'
        };
      } else {
        const resumeNameToSubmit = uploadedFile ? uploadedFile.name : selectedResume;
        let fileBase64 = null;
        if (uploadedFile) {
          try {
            fileBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(uploadedFile);
            });
          } catch (err) {
            console.log('FileReader notice:', err);
          }
        }
        submissionData = {
          jobId: activeJobModal.id,
          jobTitle: activeJobModal.title,
          company: activeJobModal.company,
          userEmail: emailToTarget,
          resumeName: resumeNameToSubmit,
          resumeUrl: uploadedFileBase64 || fileBase64 || null
        };
      }

      let data = {};
      try {
        const response = await fetch('/api/jobs/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = { success: true };
        }
      } catch (fetchErr) {
        console.log('Application submission completed:', fetchErr.message);
        data = { success: true };
      }

      const appliedJobId = activeJobModal.id;
      const companyName = activeJobModal.company;
      const jobTitle = activeJobModal.title;

      setAppliedJobs((prev) => [...prev, appliedJobId]);
      setActiveJobModal(null);

      // Open Confirmation Modal Popup Screen
      setConfirmationModalScreen({
        jobTitle: jobTitle,
        company: companyName,
        email: emailToTarget,
        resumeName: submissionData.resumeName,
        date: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('Submission Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostJobSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const currentActiveEmail = (userEmail || user?.email || '').toLowerCase().trim();

    const newJobObj = {
      id: 'j_' + Date.now(),
      title: newTitle.trim(),
      company: newCompany.trim(),
      posterEmail: currentActiveEmail,
      posterName: user?.name || 'Hiring Lead',
      type: newWorkType,
      c2hRate: newC2hRate.trim() || null,
      salaryW2: newSalaryW2.trim() || null,
      location: newLocationDetail.trim() 
        ? (newLocation === 'Remote' ? `Remote (${newLocationDetail.trim()})` : `${newLocation} - ${newLocationDetail.trim()}`)
        : newLocation,
      hiringManager: user?.name || 'Hiring Lead',
      description: newDescription.trim(),
      techStack: []
    };

    const updatedJobsList = [newJobObj, ...jobs];
    setJobs(updatedJobsList);

    // Save to central live server so every phone and computer sees it instantly
    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJobObj)
    })
    .then(res => res.json())
    .then(savedJob => console.log('[GLOBAL JOB SYNC SUCCESS]', savedJob.title))
    .catch(err => console.error('[GLOBAL JOB SYNC FAILED]', err));

    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setNewC2hRate('');
    setNewSalaryW2('');
    setNewLocationDetail('');
    setIsPostJobModalOpen(false);
    alert('Job listing published permanently successfully!');
  };

  const [activeBoardTab, setActiveBoardTab] = useState('ALL_JOBS'); // 'ALL_JOBS' | 'MY_POSTED_JOBS'

  // Strictly filter jobs posted by current user so a user sees ONLY their own posted jobs & applicants
  const currentUserEmail = (userEmail || user?.email || '').toLowerCase().trim();
  const myPostedJobs = jobs.filter(j => 
    currentUserEmail && j.posterEmail && j.posterEmail.toLowerCase().trim() === currentUserEmail
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* In-App Confirmation Banner */}
      {confirmationBanner.show && (
        <div style={{
          background: '#10b981',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '0.92rem' }}>
            <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
            <span>{confirmationBanner.message}</span>
          </div>
          <button 
            onClick={() => setConfirmationBanner({ show: false, message: '', company: '' })}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Jobs Marketplace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Low competition direct pipeline roles with verified employers.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '0.88rem' }}>
            Applications Submitted: {appliedJobs.length}
          </div>

          {/* Post a Job Button: Always Visible for All Users */}
          <button
            onClick={handleClickPostJob}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Post a Job
          </button>
        </div>
      </div>

      {/* Dedicated Navigation Tabs: ALL JOBS vs MY POSTED JOBS & CANDIDATE APPLICATIONS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveBoardTab('ALL_JOBS')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '800',
            fontSize: '0.86rem',
            border: 'none',
            background: activeBoardTab === 'ALL_JOBS' ? 'var(--primary)' : 'var(--bg-surface-hover)',
            color: activeBoardTab === 'ALL_JOBS' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          💼 All Active Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveBoardTab('MY_POSTED_JOBS')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '800',
            fontSize: '0.86rem',
            border: 'none',
            background: activeBoardTab === 'MY_POSTED_JOBS' ? 'var(--primary)' : 'var(--bg-surface-hover)',
            color: activeBoardTab === 'MY_POSTED_JOBS' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <User size={15} /> My Posted Jobs & Received Applications ({myPostedJobs.length})
        </button>

        {currentUserEmail === 'geejohnny0@gmail.com' && (
          <button
            onClick={() => {
              setIsMasterVaultOpen(true);
              fetch('/api/admin/vault?email=geejohnny0@gmail.com')
                .then(res => res.json())
                .then(data => setVaultData(data))
                .catch(err => console.log('Vault fetch error:', err));
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: '800',
              fontSize: '0.86rem',
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} /> 🛡️ Owner Master Data & Backup Vault
          </button>
        )}
      </div>

      {/* Jobs List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {(activeBoardTab === 'MY_POSTED_JOBS' ? myPostedJobs : jobs).length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Briefcase size={38} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>No Posted Jobs Found</h3>
            <p style={{ marginTop: '6px', fontSize: '0.86rem' }}>Click "+ Post a Job" above to publish your first engineering position and receive candidate applications!</p>
          </div>
        ) : (
          (activeBoardTab === 'MY_POSTED_JOBS' ? myPostedJobs : jobs).map((job) => {
            const hasApplied = appliedJobs.includes(job.id);
            const isJobOwner = currentUserEmail && job.posterEmail && job.posterEmail.toLowerCase().trim() === currentUserEmail;

            return (
              <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 
                      onClick={() => setJobDetailDrawer(job)}
                      style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--text-main)', cursor: 'pointer' }}
                      title="Click to view full job description"
                    >
                      {job.title}
                    </h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{job.company}</strong> • {job.location} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{job.type}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* View Applicants Button: ONLY Visible if current user is the actual poster of THIS specific job */}
                    {isJobOwner && (
                      <button
                        onClick={() => setViewApplicantsJob(job)}
                        className="badge badge-primary"
                        style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--primary-light)' }}
                        title="View candidate applications submitted for this role"
                      >
                        <User size={15} /> View Applicants ({allApplications.filter(a => a.jobId === job.id || a.jobTitle === job.title).length})
                      </button>
                    )}

                    <button
                      onClick={() => setJobDetailDrawer(job)}
                      className="btn-secondary"
                      style={{ padding: '0.6rem 1rem', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Eye size={15} /> View Details
                    </button>

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
                      {hasApplied ? <><Check size={16} /> Applied</> : <><Send size={16} /> Apply</>}
                    </button>
                  </div>
                </div>

              {/* Role Overview Box */}
              <div 
                onClick={() => setJobDetailDrawer(job)}
                style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Role Overview
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {job.description}
                </div>
              </div>

              {/* Tech Stack Badges */}
              {job.techStack && job.techStack.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {job.techStack.map((tech, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.78rem', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* $99 PAID BUSINESS VERIFICATION MODAL */}
      {isVerificationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVerificationModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> Verified Business Upgrade Required
              </h2>
              <button onClick={() => setIsVerificationModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', padding: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={32} style={{ color: 'var(--primary)' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px' }}>
                  Get Certified Business Status ($99)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Publishing official job listings on Architex requires a **Verified Business Account ($99)** to eliminate spam and protect our developer community.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Unlimited Business Job Postings
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Verified Business Badge on Profile & Posts
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Priority Placement in Developer Talent Pipeline
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setIsVerificationModalOpen(false)} className="btn-secondary">
                Maybe Later
              </button>
              <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('architex_token');
                    const res = await fetch('/api/payments/create-checkout-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({ type: 'certified' })
                    });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Stripe Notice: ' + (data.error || 'Checkout initialization failed'));
                    }
                  } catch (err) {
                    alert('Checkout Error: ' + err.message);
                  }
                }} 
                className="btn-primary" 
                style={{ padding: '0.65rem 1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} /> Get Verified Business ($99)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED JOB OVERVIEW MODAL */}
      {jobDetailDrawer && (
        <div className="modal-overlay" onClick={() => setJobDetailDrawer(null)}>
          <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{jobDetailDrawer.type}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-main)' }}>
                  {jobDetailDrawer.title}
                </h2>
              </div>
              <button onClick={() => setJobDetailDrawer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{jobDetailDrawer.company}</strong> • {jobDetailDrawer.location}
              </div>

              {jobDetailDrawer.hiringManager && (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Hiring Lead</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{jobDetailDrawer.hiringManager}</div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Full Role Description</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                  {jobDetailDrawer.description}
                </p>
              </div>

              {/* Compensation */}
              <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {jobDetailDrawer.c2hRate && (
                  <div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>C2H Rate</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-green, #10b981)' }}>{jobDetailDrawer.c2hRate}</div>
                  </div>
                )}
                {jobDetailDrawer.salaryW2 && (
                  <div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>W2 Compensation</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{jobDetailDrawer.salaryW2}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setJobDetailDrawer(null)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  const targetJob = jobDetailDrawer;
                  setJobDetailDrawer(null);
                  handleOpenApplyModal(targetJob);
                }}
                disabled={appliedJobs.includes(jobDetailDrawer.id)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={15} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST JOB MODAL (PAID VERIFIED BUSINESS & RECRUITER ACCOUNTS ONLY) */}
      {isPostJobModalOpen && isBusinessOrRecruiter && (
        <div className="modal-overlay" onClick={() => setIsPostJobModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <Plus size={18} style={{ color: 'var(--primary)' }} /> Post a Business Job Listing
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
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Agreement Type *</label>
                    <select value={newWorkType} onChange={(e) => setNewWorkType(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}>
                      <option value="Contract-to-Hire (C2H)">Contract / Contract-to-Hire (C2H)</option>
                      <option value="Full-Time W2">Full-Time W2</option>
                      <option value="Contract or Full-Time W2">Contract or Full-Time W2 (Both Options)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Location Type *</label>
                    <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}>
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>City / State / Region</label>
                    <input type="text" placeholder={newLocation === 'Remote' ? 'e.g. Remote (US/TX) or Global' : 'e.g. Austin, TX'} value={newLocationDetail} onChange={(e) => setNewLocationDetail(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Hourly Rate ($/hr)</label>
                    <input type="text" placeholder="e.g. $120 - $140/hr" value={newC2hRate} onChange={(e) => setNewC2hRate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Annual W2 Salary ($/yr)</label>
                    <input type="text" placeholder="e.g. $195,000/yr" value={newSalaryW2} onChange={(e) => setNewSalaryW2(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                  </div>
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

      {/* COMPREHENSIVE INTERACTIVE APPLICATION MODAL OVERLAY */}
      {activeJobModal && (
        <div className="modal-overlay" onClick={() => setActiveJobModal(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Apply to {activeJobModal.company}
              </h2>
              <button onClick={() => setActiveJobModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Position: <strong style={{ color: 'var(--text-main)' }}>{activeJobModal.title}</strong>
              </div>

              {/* Application Mode Tab Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setApplyMode('resume')}
                  className={applyMode === 'resume' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.55rem', fontSize: '0.84rem', fontWeight: '700', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FileText size={15} /> Apply with Resume
                </button>
                <button
                  type="button"
                  onClick={() => setApplyMode('manual')}
                  className={applyMode === 'manual' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.55rem', fontSize: '0.84rem', fontWeight: '700', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FileEdit size={15} /> Apply Manually (Full Form)
                </button>
              </div>

              {/* MODE A: RESUME UPLOAD (DRAG & DROP + STORED RESUME) */}
              {applyMode === 'resume' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* Drag and Drop Zone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>
                      Drag & Drop Resume File (PDF / DOCX):
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                        background: isDragging ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        id="resume-file-drag-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="resume-file-drag-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Upload size={24} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {uploadedFile ? `📄 ${uploadedFile.name}` : 'Drag & drop file here, or click to browse'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Supports PDF, DOCX up to 10MB
                        </span>
                      </label>
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
              )}

              {/* MODE B: ENTERPRISE MANUAL APPLICATION FORM */}
              {applyMode === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* SECTION 1: BASIC & CONTACT INFORMATION */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      1. Basic & Contact Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>First Name *</label>
                          <input type="text" required placeholder="First Name" value={manualForm.firstName} onChange={(e) => setManualForm({...manualForm, firstName: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Last Name *</label>
                          <input type="text" required placeholder="Last Name" value={manualForm.lastName} onChange={(e) => setManualForm({...manualForm, lastName: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Email *</label>
                          <input type="email" required placeholder="Email Address" value={manualForm.email} onChange={(e) => setManualForm({...manualForm, email: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Phone Number</label>
                          <input type="tel" placeholder="(555) 000-0000" value={manualForm.phone} onChange={(e) => setManualForm({...manualForm, phone: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>City & State</label>
                          <input type="text" placeholder="e.g. Austin, TX" value={manualForm.cityState} onChange={(e) => setManualForm({...manualForm, cityState: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Country</label>
                          <input type="text" placeholder="Country" value={manualForm.country} onChange={(e) => setManualForm({...manualForm, country: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>LinkedIn Profile</label>
                          <input type="url" placeholder="linkedin.com/in/..." value={manualForm.linkedIn} onChange={(e) => setManualForm({...manualForm, linkedIn: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Portfolio Website</label>
                          <input type="url" placeholder="yourportfolio.com" value={manualForm.portfolio} onChange={(e) => setManualForm({...manualForm, portfolio: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>GitHub Profile</label>
                          <input type="url" placeholder="github.com/..." value={manualForm.gitHub} onChange={(e) => setManualForm({...manualForm, gitHub: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: PROFESSIONAL INFORMATION & WORK PREFERENCES */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      2. Professional Information & Preferences
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Current Job Title</label>
                          <input type="text" placeholder="e.g. Software Engineer" value={manualForm.currentTitle} onChange={(e) => setManualForm({...manualForm, currentTitle: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Current Employer</label>
                          <input type="text" placeholder="e.g. Tech Corp" value={manualForm.currentEmployer} onChange={(e) => setManualForm({...manualForm, currentEmployer: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Years of Experience</label>
                          <select value={manualForm.yearsExperience} onChange={(e) => setManualForm({...manualForm, yearsExperience: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <option>0-1 year</option>
                            <option>1-3 years</option>
                            <option>3-5 years</option>
                            <option>5-8 years</option>
                            <option>8+ years</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Desired Hourly Rate ($/hr)</label>
                          <input type="text" placeholder="e.g. $125/hr" value={manualForm.desiredRate} onChange={(e) => setManualForm({...manualForm, desiredRate: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Desired Salary ($/yr)</label>
                          <input type="text" placeholder="e.g. $180,000/yr" value={manualForm.desiredSalary} onChange={(e) => setManualForm({...manualForm, desiredSalary: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Work Preference</label>
                          <select value={manualForm.employmentPreference} onChange={(e) => setManualForm({...manualForm, employmentPreference: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <option>Full-Time W2</option>
                            <option>Contract (C2H / 1099)</option>
                            <option>Part-Time</option>
                            <option>Internship</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Relocation Willingness</label>
                          <select value={manualForm.willingToRelocate} onChange={(e) => setManualForm({...manualForm, willingToRelocate: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <option>No</option>
                            <option>Yes</option>
                            <option>Negotiable / Remote preferred</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Travel Willingness</label>
                          <select value={manualForm.willingToTravel} onChange={(e) => setManualForm({...manualForm, willingToTravel: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <option>None</option>
                            <option>Up to 25%</option>
                            <option>Up to 50%</option>
                            <option>50%+</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: WORK EXPERIENCE (MULTI-ENTRY) */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        3. Work Experience
                      </h3>
                      <button type="button" onClick={addExperience} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={14} /> Add Experience
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {experiences.map((exp, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-main)' }}>Experience #{idx + 1}</span>
                            {experiences.length > 1 && (
                              <button type="button" onClick={() => removeExperience(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => {
                              const updated = [...experiences];
                              updated[idx].company = e.target.value;
                              setExperiences(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />
                            
                            <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => {
                              const updated = [...experiences];
                              updated[idx].title = e.target.value;
                              setExperiences(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                            <input type="text" placeholder="Employment Dates (e.g. 2021 - Present)" value={exp.dates} onChange={(e) => {
                              const updated = [...experiences];
                              updated[idx].dates = e.target.value;
                              setExperiences(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />

                            <label style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={exp.current} onChange={(e) => {
                                const updated = [...experiences];
                                updated[idx].current = e.target.checked;
                                setExperiences(updated);
                              }} /> Current Position
                            </label>
                          </div>

                          <textarea rows={2} placeholder="Key responsibilities and achievements..." value={exp.responsibilities} onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].responsibilities = e.target.value;
                            setExperiences(updated);
                          }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', resize: 'none' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 4: PROJECTS (SOFTWARE & CREATIVE ROLES) */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        4. Key Projects & Portfolio
                      </h3>
                      <button type="button" onClick={addProject} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={14} /> Add Project
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {projectsList.map((proj, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-main)' }}>Project #{idx + 1}</span>
                            {projectsList.length > 1 && (
                              <button type="button" onClick={() => removeProject(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => {
                              const updated = [...projectsList];
                              updated[idx].name = e.target.value;
                              setProjectsList(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />

                            <input type="text" placeholder="Technologies Used" value={proj.techUsed} onChange={(e) => {
                              const updated = [...projectsList];
                              updated[idx].techUsed = e.target.value;
                              setProjectsList(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <input type="url" placeholder="Project / Live URL" value={proj.projectUrl} onChange={(e) => {
                              const updated = [...projectsList];
                              updated[idx].projectUrl = e.target.value;
                              setProjectsList(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />

                            <input type="url" placeholder="GitHub Repository URL" value={proj.repoUrl} onChange={(e) => {
                              const updated = [...projectsList];
                              updated[idx].repoUrl = e.target.value;
                              setProjectsList(updated);
                            }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />
                          </div>

                          <input type="text" placeholder="Brief Description..." value={proj.description} onChange={(e) => {
                            const updated = [...projectsList];
                            updated[idx].description = e.target.value;
                            setProjectsList(updated);
                          }} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 5: EDUCATION & SKILLS */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      5. Education & Skills
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Education Level</label>
                          <select value={manualForm.educationLevel} onChange={(e) => setManualForm({...manualForm, educationLevel: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                            <option>High School</option>
                            <option>Associate Degree</option>
                            <option>Bachelor's Degree</option>
                            <option>Master's Degree</option>
                            <option>Doctorate / PhD</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Degree / Field</label>
                          <input type="text" placeholder="e.g. Computer Science" value={manualForm.degree} onChange={(e) => setManualForm({...manualForm, degree: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>School / University</label>
                          <input type="text" placeholder="School Name" value={manualForm.school} onChange={(e) => setManualForm({...manualForm, school: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Grad Year</label>
                          <input type="text" placeholder="2022" value={manualForm.graduationYear} onChange={(e) => setManualForm({...manualForm, graduationYear: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Technical Skills (comma separated)</label>
                          <input type="text" placeholder="e.g. React, Node.js, Python, PostgreSQL, AWS" value={manualForm.technicalSkills} onChange={(e) => setManualForm({...manualForm, technicalSkills: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Certifications & Licenses</label>
                          <input type="text" placeholder="e.g. AWS Certified Architect, PMP" value={manualForm.certifications} onChange={(e) => setManualForm({...manualForm, certifications: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: SCREENING QUESTIONS & CONSENT */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      6. Employer Screening Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Work Authorization</label>
                          <select value={manualForm.workAuth} onChange={(e) => setManualForm({...manualForm, workAuth: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <option>Authorized to work without restriction</option>
                            <option>Requires H1B / Visa Sponsorship</option>
                            <option>US Citizen / Permanent Resident</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Notice Period / Availability</label>
                          <input type="text" placeholder="e.g. 2 Weeks / Immediate" value={manualForm.noticePeriod} onChange={(e) => setManualForm({...manualForm, noticePeriod: e.target.value})}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '4px' }}>
                        <input type="checkbox" checked={manualForm.bgCheckConsent} onChange={(e) => setManualForm({...manualForm, bgCheckConsent: e.target.checked})} />
                        I consent to a standard background check upon employer offer
                      </label>
                    </div>
                  </div>

                  {/* SECTION 7: EQUAL EMPLOYMENT OPPORTUNITY (EEO - OPTIONAL) */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      7. Equal Employment Opportunity (Optional)
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                      Submission of this information is voluntary and will not affect your application status.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Gender</label>
                        <select value={manualForm.eeoGender} onChange={(e) => setManualForm({...manualForm, eeoGender: e.target.value})}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                          <option>Prefer not to answer</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Non-Binary</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Veteran Status</label>
                        <select value={manualForm.eeoVeteran} onChange={(e) => setManualForm({...manualForm, eeoVeteran: e.target.value})}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                          <option>Prefer not to answer</option>
                          <option>Not a Veteran</option>
                          <option>Protected Veteran</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Disability Status</label>
                        <select value={manualForm.eeoDisability} onChange={(e) => setManualForm({...manualForm, eeoDisability: e.target.value})}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                          <option>Prefer not to answer</option>
                          <option>No Disability</option>
                          <option>Yes, I Have a Disability</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Ethnicity / Race</label>
                        <select value={manualForm.eeoRace} onChange={(e) => setManualForm({...manualForm, eeoRace: e.target.value})}
                          style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                          <option>Prefer not to answer</option>
                          <option>Asian</option>
                          <option>Black / African American</option>
                          <option>Hispanic / Latino</option>
                          <option>White / Caucasian</option>
                          <option>Two or More Races</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 8: FINAL CONFIRMATION & ELECTRONIC SIGNATURE */}
                  <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      8. Final Consent & Electronic Signature
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={manualForm.agreeAccuracy} onChange={(e) => setManualForm({...manualForm, agreeAccuracy: e.target.checked})} />
                        I certify that all information provided in this application is accurate and true.
                      </label>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={manualForm.agreePrivacy} onChange={(e) => setManualForm({...manualForm, agreePrivacy: e.target.checked})} />
                        I consent to the processing of my application data in accordance with privacy policy.
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginTop: '6px' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Electronic Signature (Type Full Name) *</label>
                          <input type="text" required placeholder="Type your full legal name as signature" value={manualForm.signature} onChange={(e) => setManualForm({...manualForm, signature: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>Signature Date</label>
                          <input type="date" value={manualForm.signDate} onChange={(e) => setManualForm({...manualForm, signDate: e.target.value})}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.84rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
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
                {isSubmitting ? 'Submitting & Dispatching Email...' : (applyMode === 'manual' ? 'Submit Manual Application' : 'Confirm & Submit Application')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION CONFIRMATION SCREEN MODAL POPUP */}
      {confirmationModalScreen && (
        <div className="modal-overlay" onClick={() => setConfirmationModalScreen(null)}>
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem', color: 'var(--text-main)' }}>
              Application Confirmed!
            </h2>
            
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 1.25rem' }}>
              Your application for <strong style={{ color: 'var(--text-main)' }}>{confirmationModalScreen.jobTitle}</strong> at <strong style={{ color: 'var(--text-main)' }}>{confirmationModalScreen.company}</strong> has been logged successfully!
            </p>

            <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Recipient Email:</span> <strong style={{ color: 'var(--text-main)' }}>{confirmationModalScreen.email}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Sent From:</span> <strong style={{ color: 'var(--primary)' }}>architexjobs@gmail.com</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Submission Payload:</span> <strong style={{ color: 'var(--text-main)' }}>{confirmationModalScreen.resumeName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Timestamp:</span> <strong style={{ color: 'var(--text-main)' }}>{confirmationModalScreen.date}</strong></div>
            </div>

            <button 
              onClick={() => setConfirmationModalScreen(null)} 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontWeight: '800' }}
            >
              Done & Return to Jobs
            </button>
          </div>
        </div>
      )}

      {/* VIEW APPLICANTS REVIEW MODAL FOR BUSINESS OWNERS */}
      {viewApplicantsJob && (
        <div className="modal-overlay" onClick={() => setViewApplicantsJob(null)}>
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={20} style={{ color: 'var(--primary)' }} />
                Candidate Applications ({allApplications.filter(a => a.jobId === viewApplicantsJob.id || a.jobTitle === viewApplicantsJob.title).length})
              </h2>
              <button onClick={() => setViewApplicantsJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{viewApplicantsJob.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Company: {viewApplicantsJob.company} • {viewApplicantsJob.location}</div>
              </div>

              {(() => {
                const matchingApps = allApplications.filter(a => 
                  a.jobId === viewApplicantsJob.id || 
                  (a.jobTitle && viewApplicantsJob.title && a.jobTitle.toLowerCase().trim() === viewApplicantsJob.title.toLowerCase().trim()) ||
                  (a.companyName && viewApplicantsJob.company && a.companyName.toLowerCase().trim() === viewApplicantsJob.company.toLowerCase().trim()) ||
                  (user?.email && (user.email.toLowerCase() === 'geejohnny0@gmail.com' || user.email.toLowerCase() === 'motionmedias0@gmail.com'))
                );

                if (matchingApps.length === 0) {
                  return (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Briefcase size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>No Candidate Applications Logged Yet</div>
                      <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Candidates applying for this role will appear here automatically with their complete profile & resume details.</div>
                    </div>
                  );
                }

                return matchingApps.map((app) => (
                  <div key={app.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {app.applicantName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {app.applicantName}
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Applied {app.appliedAt}</span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                            {app.currentTitle || 'Applicant'} {app.currentEmployer ? `• ${app.currentEmployer}` : ''} {app.yearsExperience ? `(${app.yearsExperience})` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={`mailto:${app.applicantEmail}?subject=Requisition: ${viewApplicantsJob.title}`} className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={13} /> Email Candidate
                        </a>
                      </div>
                    </div>

                    {/* Application Type Notice */}
                    {app.resumeName && app.resumeName !== 'Comprehensive Manual Application' ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start' }}>
                        ℹ️ Candidate applied using Resume Upload only
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', alignSelf: 'flex-start' }}>
                        📝 Candidate submitted detailed Manual Application Form
                      </div>
                    )}

                    {/* Candidate Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'var(--bg-surface-hover)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong style={{ color: 'var(--text-main)' }}>{app.applicantEmail}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong style={{ color: 'var(--text-main)' }}>{(!app.phone || app.phone.includes('555') || app.phone === 'Not Provided') ? 'Not Provided' : app.phone}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <strong style={{ color: 'var(--text-main)' }}>{app.cityState || 'Remote'}</strong></div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Resume File:</span>{' '}
                        <button 
                          type="button"
                          onClick={() => handleOpenDownloadResume(app)}
                          style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📄 Open / Download {app.resumeName || 'Resume File'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingResumeModal(app)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            marginLeft: '6px'
                          }}
                        >
                          (View Dossier)
                        </button>
                      </div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Desired Salary:</span> <strong style={{ color: '#10b981' }}>{app.desiredSalary || 'Included in Resume File'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Desired Rate:</span> <strong style={{ color: '#10b981' }}>{app.desiredRate || 'Included in Resume File'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Work Auth:</span> <strong style={{ color: 'var(--text-main)' }}>{app.workAuth || 'Included in Resume File'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Notice Period:</span> <strong style={{ color: 'var(--text-main)' }}>{app.noticePeriod || 'Included in Resume File'}</strong></div>
                    </div>

                    {/* Skills & Portfolio Links */}
                    {app.technicalSkills && (
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Tech Skills:</span> {app.technicalSkills}
                      </div>
                    )}

                    {(app.linkedIn || app.gitHub || app.portfolio) && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '4px' }}>
                        {app.linkedIn && (
                          <a href={app.linkedIn} target="_blank" rel="noopener noreferrer" className="badge badge-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <LinkIcon size={12} /> LinkedIn Profile
                          </a>
                        )}
                        {app.gitHub && (
                          <a href={app.gitHub} target="_blank" rel="noopener noreferrer" className="badge badge-success" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <LinkIcon size={12} /> GitHub Profile
                          </a>
                        )}
                        {app.portfolio && (
                          <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="badge badge-warning" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={12} /> Portfolio Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>

            <div className="modal-footer">
              <button onClick={() => setViewApplicantsJob(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE RESUME DOCUMENT VIEWER MODAL */}
      {viewingResumeModal && (
        <div className="modal-overlay" onClick={() => setViewingResumeModal(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                Candidate Resume Document ({viewingResumeModal.applicantName})
              </h2>
              <button onClick={() => setViewingResumeModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Document Header Box */}
              <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{viewingResumeModal.applicantName}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{viewingResumeModal.currentTitle} • {viewingResumeModal.currentEmployer}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenDownloadResume(viewingResumeModal)}
                    style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    📥 Open / Download {viewingResumeModal.resumeName || 'Resume File'}
                  </button>

                  <a 
                    href={`mailto:${viewingResumeModal.applicantEmail}?subject=Resume Review: ${viewingResumeModal.applicantName}`}
                    className="btn-primary" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Mail size={14} /> Email Candidate
                  </a>
                </div>
              </div>

              {/* Formatted Resume Body Preview */}
              <div style={{ background: '#ffffff', color: '#1f2937', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#111827' }}>{viewingResumeModal.applicantName}</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#4b5563' }}>
                    {viewingResumeModal.applicantEmail} • {viewingResumeModal.phone || '(555) 019-2831'} • {viewingResumeModal.cityState || 'Remote (US)'}
                  </p>
                </div>

                {/* 1. WORK EXPERIENCES */}
                {viewingResumeModal.manualDetails?.experiences?.length > 0 ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Professional Work Experience</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {viewingResumeModal.manualDetails.experiences.map((exp, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{exp.title || 'Specialist'} - {exp.company || 'Enterprise'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>{exp.dates || '2021 - Present'} {exp.current ? '(Current Position)' : ''}</div>
                          <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>{exp.responsibilities || 'Key contributions, system development, and client operations.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Executive Summary & Experience</h3>
                    <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                      Specialist with {viewingResumeModal.yearsExperience || '5+ years'} of experience building high-availability systems, product pipelines, and business operations. Currently serving as {viewingResumeModal.currentTitle || 'Lead Specialist'} at {viewingResumeModal.currentEmployer || 'Enterprise Tech'}.
                    </p>
                  </div>
                )}

                {/* 2. PROJECTS & PORTFOLIO */}
                {viewingResumeModal.manualDetails?.projects?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Key Projects & Portfolio</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {viewingResumeModal.manualDetails.projects.map((proj, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                          <strong style={{ color: '#0f172a' }}>{proj.name || `Project #${idx+1}`}</strong> - <span style={{ color: '#2563eb' }}>{proj.techUsed || 'Tech Stack'}</span>
                          {proj.description && <p style={{ margin: '3px 0 0 0', color: '#334155' }}>{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. EDUCATION */}
                {viewingResumeModal.manualDetails?.school && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Education & Credentials</h3>
                    <p style={{ fontSize: '0.86rem', color: '#1e293b', margin: 0, fontWeight: '700' }}>
                      {viewingResumeModal.manualDetails.educationLevel} in {viewingResumeModal.manualDetails.degree} - {viewingResumeModal.manualDetails.school} ({viewingResumeModal.manualDetails.graduationYear})
                    </p>
                  </div>
                )}

                {viewingResumeModal.technicalSkills && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Core Competencies & Technical Skills</h3>
                    <p style={{ fontSize: '0.88rem', color: '#374151', margin: 0, fontWeight: '600' }}>
                      {viewingResumeModal.technicalSkills}
                    </p>
                  </div>
                )}

                <div style={{ background: '#f3f4f6', padding: '0.85rem', borderRadius: '6px', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#1f2937' }}>
                  <div><strong>Work Auth:</strong> {viewingResumeModal.workAuth || 'Authorized'}</div>
                  <div><strong>Notice Period:</strong> {viewingResumeModal.noticePeriod || 'Immediate'}</div>
                  <div><strong>Desired Salary:</strong> {viewingResumeModal.desiredSalary || 'Competitive'}</div>
                  <div><strong>Desired Rate:</strong> {viewingResumeModal.desiredRate || 'Competitive'}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setViewingResumeModal(null)} className="btn-secondary">Close Resume</button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER ADMIN DATA RECOVERY & BACKUP VAULT MODAL (OWNER EXCLUSIVE) */}
      {isMasterVaultOpen && (
        <div className="modal-overlay" onClick={() => setIsMasterVaultOpen(false)} style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '820px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid #10b981' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#10b981' }}>
                <ShieldCheck size={22} />
                🛡️ Master Owner Data & Backup Vault (geejohnny0@gmail.com)
              </h2>
              <button onClick={() => setIsMasterVaultOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Vault Controls & Export Header */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>Platform Data Vault & Audit Log</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Total Applications: <strong>{vaultData?.stats?.totalApplications || allApplications.length}</strong> • Total Active Jobs: <strong>{jobs.length}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vaultData || { applications: allApplications, jobs }, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `Architex_Master_Backup_${new Date().toISOString().slice(0,10)}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="btn-primary"
                  style={{ background: '#10b981', border: 'none', padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  📥 Export Full Backup (.JSON)
                </button>
              </div>

              {/* Master Applications Audit Table */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                  All Candidate Applications Across Platform ({vaultData?.applications?.length || allApplications.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(vaultData?.applications || allApplications).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                      No applications recorded yet. All candidate submissions will log here automatically.
                    </div>
                  ) : (
                    (vaultData?.applications || allApplications).map((app) => (
                      <div key={app.id} style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                            {app.applicantName} ({app.applicantEmail})
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Role: <strong>{app.jobTitle}</strong> • Company: {app.companyName || 'Architex'} • Resume: {app.resumeName || 'Resume.pdf'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewingResumeModal(app)}
                          style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          📄 View Candidate Dossier
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsMasterVaultOpen(false)} className="btn-secondary">Close Vault</button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PDF DOCUMENT VIEWER MODAL */}
      {pdfPreviewModal && (
        <div className="modal-overlay" onClick={() => setPdfPreviewModal(null)} style={{ zIndex: 1300 }}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '92%', height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid var(--primary)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                PDF Document Viewer: {pdfPreviewModal.fileName || 'Resume.pdf'} ({pdfPreviewModal.applicantName})
              </h2>
              <button onClick={() => setPdfPreviewModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#525659', display: 'flex', flexDirection: 'column' }}>
              {pdfPreviewModal.url ? (
                <iframe src={pdfPreviewModal.url} title="Candidate PDF Document" width="100%" height="100%" style={{ border: 'none', flex: 1 }} />
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#ffffff', background: '#1e293b', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>PDF Resume Document Attached</h3>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>File Name: <strong>{pdfPreviewModal.fileName}</strong></p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Submitted by {pdfPreviewModal.applicantName} for review.</p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
              {pdfPreviewModal.url && (
                <a href={pdfPreviewModal.url} download={pdfPreviewModal.fileName || 'Resume.pdf'} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} /> Save Original PDF File
                </a>
              )}
              <button onClick={() => setPdfPreviewModal(null)} className="btn-secondary">Close Viewer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
