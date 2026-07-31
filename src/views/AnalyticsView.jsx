import React, { useState } from 'react';
import { 
  ArrowLeft, Users, Building2, ShieldCheck, Briefcase, Filter, Search, 
  CheckCircle2, Star, Calendar, MessageSquare, Award, ArrowUpRight, 
  UserCheck, DollarSign, Sparkles, MapPin, Clock, BadgeCheck, Bookmark,
  TrendingUp, Check, ExternalLink, ChevronRight, X
} from 'lucide-react';

export default function AnalyticsView({ onNavigate, onSendOfferMessage }) {
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [hiredModal, setHiredModal] = useState(null);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);

  // Clean Real Live Candidate Pool
  const [candidatePool, setCandidatePool] = useState([]);

  // New Candidate Form State
  const [newCandName, setNewCandName] = useState('');
  const [newCandRole, setNewCandRole] = useState('Principal Software Developer');
  const [newCandRate, setNewCandRate] = useState('$125 / hr C2H');
  const [newCandSalary, setNewCandSalary] = useState('$195,000 / yr W2');
  const [newCandBio, setNewCandBio] = useState('');

  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    if (!newCandName.trim()) return;

    const newCandidateObj = {
      id: 'cand_' + Date.now(),
      name: newCandName.trim(),
      headline: `${newCandRole} | Verified Architex Candidate`,
      role: newCandRole,
      category: newCandRole.includes('CTO') ? 'CTO' : 'DEV',
      workType: 'C2H & W2',
      matchScore: '98% Match',
      isRecommended: true,
      badge: 'Verified Candidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rate: newCandRate,
      salaryW2: newCandSalary,
      location: 'Remote',
      skills: ['React 14', 'TypeScript', 'Node.js', 'Python'],
      experience: '8+ Years Exp',
      availability: 'Available Immediately',
      verifiedC2H: true,
      bio: newCandBio.trim() || 'Senior developer specializing in high-throughput enterprise applications.'
    };

    setCandidatePool([newCandidateObj, ...candidatePool]);
    setNewCandName('');
    setNewCandBio('');
    setIsAddCandidateOpen(false);
  };

  const toggleSaveCandidate = (id) => {
    setSavedCandidates(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const filteredTalent = candidatePool.filter(t => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
                          t.name.toLowerCase().includes(query) || 
                          t.headline.toLowerCase().includes(query) ||
                          t.role.toLowerCase().includes(query) ||
                          t.skills.some(s => s.toLowerCase().includes(query));
    
    const matchesWorkType = roleTypeFilter === 'ALL' || 
                            (roleTypeFilter === 'C2H' && t.workType.includes('C2H')) ||
                            (roleTypeFilter === 'W2' && t.workType.includes('W2')) ||
                            (roleTypeFilter === 'FRACTIONAL' && t.role.includes('Fractional'));

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesWorkType && matchesCategory;
  });

  const recommendedTalent = candidatePool.filter(t => t.isRecommended);

  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh', 
      padding: '1.5rem', 
      color: '#1e293b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* 1. TOP HEADER & CANDIDATE SEARCH ENGINE */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        padding: '1.25rem 1.75rem',
        border: '1px solid #e2e8f0',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                background: '#ffffff',
                color: '#0a66c2',
                border: '1px solid #0a66c2',
                borderRadius: '20px',
                padding: '0.45rem 1.15rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> Back to Main App
            </button>
            
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0a66c2', margin: 0 }}>
                Architex Enterprise Recruiter & Talent Engine
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '2px 0 0 0' }}>
                Search and hire Software Developers, Engineering Managers, and CTOs (Contract-to-Hire & W2).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: '1rem', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a66c2' }}>{candidatePool.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Active Candidates</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#059669' }}>100%</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Verified Rate</div>
              </div>
            </div>

            <button 
              onClick={() => setIsAddCandidateOpen(true)}
              style={{
                background: '#0a66c2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '0.6rem 1.4rem',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={16} /> Add Candidate to Pool
            </button>
          </div>
        </div>

        {/* PROMINENT CANDIDATE SEARCH ENGINE BAR */}
        <div style={{
          background: '#f1f5f9',
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0a66c2' }} />
              <input 
                type="text"
                placeholder="Search candidate names, titles (Software Developer, CTO, Manager), skills (React, Python, Rust)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.8rem 0.7rem 2.6rem',
                  borderRadius: '20px',
                  border: '1.5px solid #0a66c2',
                  background: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <button 
              onClick={() => alert(`Searching candidate pool for: "${searchQuery}"`)}
              style={{
                background: '#0a66c2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '0.7rem 1.6rem',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Search Candidates
            </button>
          </div>

          {/* Agreement Pills Under Search Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Filter by Agreement:</span>
            {[
              { id: 'ALL', label: 'All Candidates' },
              { id: 'C2H', label: 'Contract to Hire (C2H)' },
              { id: 'W2', label: 'Full-Time W2' },
              { id: 'FRACTIONAL', label: 'Fractional CTO / Executive' }
            ].map(pill => (
              <button 
                key={pill.id}
                onClick={() => setRoleTypeFilter(pill.id)}
                style={{
                  fontSize: '0.78rem',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: roleTypeFilter === pill.id ? '#0a66c2' : '#cbd5e1',
                  background: roleTypeFilter === pill.id ? '#0a66c2' : '#ffffff',
                  color: roleTypeFilter === pill.id ? '#ffffff' : '#334155',
                  fontWeight: roleTypeFilter === pill.id ? '700' : '600',
                  cursor: 'pointer'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. RECOMMENDED CANDIDATES HERO SECTION */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        border: '1px solid #e2e8f0',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#0a66c2' }} /> Recommended Candidates for Your Openings
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#0a66c2', fontWeight: '700' }}>Vetted & Matched</span>
        </div>

        {/* Recommended Cards Carousel Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {recommendedTalent.slice(0, 3).map((rec) => (
            <div 
              key={rec.id}
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={rec.avatar} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0a66c2' }} />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#1e293b' }}>{rec.name}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0a66c2' }}>{rec.role}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: '800', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '12px' }}>
                    {rec.matchScore}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rec.bio}
                </p>

                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#059669', marginBottom: '10px' }}>
                  C2H: {rec.rate} - W2: {rec.salaryW2}
                </div>
              </div>

              <button 
                onClick={() => setHiredModal(rec)}
                style={{
                  width: '100%',
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0.45rem',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> Send Direct Offer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MAIN CANDIDATE SEARCH RESULTS GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#334155' }}>
            Candidate Search Results ({filteredTalent.length})
          </span>

          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Saved Candidates: <strong style={{ color: '#0a66c2' }}>{savedCandidates.length}</strong>
          </span>
        </div>

        {filteredTalent.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e0f2fe', color: '#0a66c2', padding: '1rem', borderRadius: '50%', marginBottom: '4px' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Candidate Pool is Empty</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', margin: 0 }}>
              Recruiters & hiring teams can add verified software developers, managers, and CTOs to their talent pipeline!
            </p>
            <button 
              onClick={() => setIsAddCandidateOpen(true)}
              style={{ marginTop: '8px', background: '#0a66c2', color: '#ffffff', border: 'none', padding: '0.65rem 1.35rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              <Users size={16} style={{ display: 'inline', marginRight: '6px' }} /> Add Candidate Profile
            </button>
          </div>
        ) : (
          filteredTalent.map((candidate) => (
          <div 
            key={candidate.id}
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '1.35rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            
            {/* Header Profile Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img 
                  src={candidate.avatar} 
                  alt={candidate.name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0a66c2' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                      {candidate.name}
                    </h3>
                    <BadgeCheck size={18} style={{ color: '#0a66c2' }} />
                    <span style={{ fontSize: '0.72rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                      {candidate.availability}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: '600', marginTop: '2px' }}>
                    {candidate.headline}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} /> {candidate.location}</span>
                    <span>- {candidate.experience}</span>
                  </div>
                </div>
              </div>

              {/* Candidate Save Button */}
              <button 
                onClick={() => toggleSaveCandidate(candidate.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: savedCandidates.includes(candidate.id) ? '#0a66c2' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  fontWeight: '700'
                }}
              >
                <Bookmark size={18} fill={savedCandidates.includes(candidate.id) ? '#0a66c2' : 'none'} />
                {savedCandidates.includes(candidate.id) ? 'Saved' : 'Save Candidate'}
              </button>
            </div>

            {/* Bio Summary */}
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              {candidate.bio}
            </p>

            {/* Skills Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {candidate.skills.map((skill, idx) => (
                <span key={idx} style={{
                  fontSize: '0.76rem',
                  background: '#f1f5f9',
                  color: '#334155',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  border: '1px solid #cbd5e1'
                }}>
                  {skill}
                </span>
              ))}
            </div>

            {/* Rates & Compensation Comparison Banner */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '0.85rem 1.15rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Contract / C2H Hourly Rate</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669' }}>{candidate.rate}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Full-Time W2 Expected Salary</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0a66c2' }}>{candidate.salaryW2}</div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button 
                onClick={() => setHiredModal(candidate)}
                style={{
                  background: '#ffffff',
                  color: '#0a66c2',
                  border: '1px solid #0a66c2',
                  borderRadius: '18px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Calendar size={14} /> Schedule Interview
              </button>

              <button 
                onClick={() => setHiredModal(candidate)}
                style={{
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '0.5rem 1.35rem',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={14} /> Send Direct Offer
              </button>
            </div>

          </div>
        )))}

      </div>

      {/* Recruiter Offer / Interview Modal */}
      {hiredModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0a66c2', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} /> Direct Candidate Offer
              </h2>
              <button onClick={() => setHiredModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <img src={hiredModal.avatar} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>{hiredModal.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#0a66c2', fontWeight: '700' }}>{hiredModal.role}</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{hiredModal.location}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Offer Type:</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}>
                  <option>Contract-to-Hire (C2H) - {hiredModal.rate}</option>
                  <option>Full-Time W2 Employee - {hiredModal.salaryW2}</option>
                  <option>Fractional Executive Retainer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Offer Note / Pitch Message:</label>
                <textarea 
                  rows={4}
                  defaultValue={`Hi ${hiredModal.name.split(' ')[0]},\n\nWe reviewed your background on Architex Enterprise Recruiter and would love to discuss joining our team for a ${hiredModal.workType} opportunity.`}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setHiredModal(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '18px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={() => {
                  alert(`Direct offer sent to ${hiredModal.name}! The candidate has been notified.`);
                  setHiredModal(null);
                }} 
                style={{ flex: 1, padding: '0.65rem', borderRadius: '18px', border: 'none', background: '#0a66c2', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isAddCandidateOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0a66c2', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Add Verified Candidate Profile
              </h2>
              <button onClick={() => setIsAddCandidateOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddCandidateSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Candidate Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={newCandName}
                    onChange={(e) => setNewCandName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Desired Role / Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Staff React Architect"
                      value={newCandRole}
                      onChange={(e) => setNewCandRole(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Desired Rate ($/hr)</label>
                    <input 
                      type="text"
                      placeholder="e.g. $130 / hr C2H"
                      value={newCandRate}
                      onChange={(e) => setNewCandRate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Candidate Bio & Technical Expertise</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly state key technical competencies, architecture skills, and experience..."
                    value={newCandBio}
                    onChange={(e) => setNewCandBio(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsAddCandidateOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '18px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '18px', border: 'none', background: '#0a66c2', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
