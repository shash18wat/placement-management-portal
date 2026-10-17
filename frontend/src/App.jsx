import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from './icons.jsx'

const sampleOpportunities = [
  {
    id: 'example-frontend-intern',
    company_id: 'example-employer',
    role: 'Frontend Developer Intern',
    organization: 'Example employer',
    location: 'Remote',
    type: 'Internship',
    skills: ['React', 'JavaScript', 'CSS'],
    description: 'Support a product team by building accessible interface components, fixing UI issues, and documenting your work.',
    minimum_gpa: 7.0,
    maximum_backlogs: 0,
    example: true,
  },
  {
    id: 'example-api-tester',
    company_id: 'example-employer',
    role: 'QA Automation Intern',
    organization: 'Example employer',
    location: 'Hybrid',
    type: 'Internship',
    skills: ['Python', 'API testing', 'Git'],
    description: 'Help create repeatable API checks, report defects clearly, and work with engineers to verify fixes.',
    minimum_gpa: null,
    maximum_backlogs: 1,
    example: true,
  },
  {
    id: 'example-data-associate',
    company_id: 'example-employer',
    role: 'Junior Data Associate',
    organization: 'Example employer',
    location: 'On-site',
    type: 'Entry level',
    skills: ['SQL', 'Spreadsheets', 'Communication'],
    description: 'Prepare clean reports, investigate data questions, and share findings with a small operations team.',
    minimum_gpa: null,
    maximum_backlogs: null,
    example: true,
  },
]

const emptyProfile = {
  fullName: '',
  email: '',
  program: '',
  graduationYear: '',
  gpa: '',
  activeBacklogs: '',
  targetRole: '',
  skills: '',
  resumeSummary: '',
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'companies', label: 'Companies', icon: 'roles' },
  { id: 'opportunities', label: 'Opportunities', icon: 'roles' },
  { id: 'applications', label: 'My applications', icon: 'applications' },
  { id: 'feedback', label: 'AI feedback', icon: 'feedback' },
]

function readLocal(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function saveLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return false
  }
  return true
}

function initialLocalOpportunities() {
  const saved = readLocal('placement-portal-opportunities-v1', null)
  return Array.isArray(saved) ? saved : sampleOpportunities
}

function localReview(form) {
  const words = form.summary.trim().split(/\s+/).filter(Boolean)
  const skills = form.skills.split(/,|\n/).map((item) => item.trim()).filter(Boolean)
  const summary = form.summary.toLowerCase()
  const strengths = []
  const focusAreas = []

  if (skills.length > 0) {
    strengths.push('You named ' + skills.slice(0, 4).join(', ') + '. Keep the skills that you can demonstrate with coursework or project work.')
  }
  if (/project|built|developed|created|implemented/i.test(form.summary)) {
    strengths.push('Your summary mentions practical work. Keep the explanation tied to your own contribution.')
  }
  if (strengths.length === 0) {
    strengths.push('You have a starting point for a role-specific review. Add concrete examples so the feedback can be more specific.')
  }

  if (words.length < 70) {
    focusAreas.push({
      title: 'Add one concrete example',
      evidence: 'The summary is brief, so it is hard to see how you applied your skills.',
      action: 'Describe one project or coursework example, the tools you used, and what you personally completed.',
    })
  }
  if (skills.length < 3) {
    focusAreas.push({
      title: 'Make the skill match clearer',
      evidence: 'Fewer than three skills were listed for the target role.',
      action: 'Add relevant skills you can support with evidence. Do not add tools you have not used.',
    })
  }
  if (!/result|reduced|improved|delivered|tested|designed|analyzed|analysed|presented/i.test(summary)) {
    focusAreas.push({
      title: 'Show your contribution',
      evidence: 'The summary does not yet describe a clear outcome or deliverable.',
      action: 'State what you delivered or tested. Include a number only when you can verify it.',
    })
  }
  if (!form.targetRole.trim()) {
    focusAreas.push({
      title: 'Choose a target role',
      evidence: 'No target role was supplied for this review.',
      action: 'Enter a specific role title so the review can focus on relevant requirements.',
    })
  }
  if (focusAreas.length === 0) {
    focusAreas.push({
      title: 'Tailor the opening lines',
      evidence: 'The summary includes role-related skills and examples.',
      action: 'Move the most relevant example for ' + form.targetRole + ' near the beginning, then check that each claim is accurate.',
    })
  }

  return {
    source: 'local_checks',
    overview: 'This built-in review checks for role focus, relevant skills, and evidence of practical work. It does not rank candidates or make hiring decisions.',
    strengths: strengths,
    focus_areas: focusAreas,
    next_steps: [
      'Choose one focus area and revise the resume summary before running the review again.',
      'Check every skill and result against work you can explain in an interview.',
    ],
  }
}

function ProfileProgress({ profile }) {
  const fields = [profile.fullName, profile.email, profile.program, profile.graduationYear, profile.targetRole, profile.skills, profile.resumeSummary]
  const complete = fields.filter((field) => String(field || '').trim()).length
  if (complete === fields.length) return <span className="status-chip status-chip--complete">Profile ready</span>
  return <span className="status-chip">{complete} of {fields.length} profile fields</span>
}

function LegalPage({ kind }) {
  const privacy = kind === 'privacy'
  const [publicDemo, setPublicDemo] = useState(true)
  const [resumeUploadsEnabled, setResumeUploadsEnabled] = useState(false)
  useEffect(() => {
    fetch('/api/status').then((response) => response.ok ? response.json() : null).then((data) => {
      setPublicDemo(Boolean(data?.public_demo))
      setResumeUploadsEnabled(Boolean(data?.resume_uploads_enabled))
    }).catch(() => {})
  }, [])
  return (
    <main className="legal-shell">
      <a className="back-link" href="/"><Icon name="arrow" size={17} /> Return to portal</a>
      <div className="legal-document">
        <p className="eyebrow">PLACEMENT MANAGEMENT PORTAL</p>
        <h1>{privacy ? 'Privacy and data use' : 'Terms of use'}</h1>
        <p className="legal-date">Project draft · 17 October 2026</p>
        {privacy ? <PrivacyContent publicDemo={publicDemo} resumeUploadsEnabled={resumeUploadsEnabled} /> : <TermsContent publicDemo={publicDemo} resumeUploadsEnabled={resumeUploadsEnabled} />}
        <div className="legal-draft-note">
          <strong>Before a public launch:</strong> the project owner must identify the operating institution, add a monitored privacy contact, set a retention period, and review these draft terms for the laws and policies that apply to the deployment.
        </div>
        <div className="legal-footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </div>
    </main>
  )
}

function PrivacyContent({ publicDemo, resumeUploadsEnabled }) {
  const publicUploadNotice = resumeUploadsEnabled
    ? 'A public test upload includes the profile details entered for that submission and a PDF or DOCX file. The server stores these files temporarily for up to 24 hours; Render may remove them earlier when the free service restarts or spins down. Submissions are not sent to employers, and the public demo has no coordinator records screen. Use fictional details and a sample file only.'
    : 'Resume uploads and coordinator record access are disabled in public mode.'
  return (
    <div className="legal-copy">
      <section><h2>What this project stores</h2>{publicDemo ? <><p>This public portfolio demo has no user accounts. Your profile and saved roles stay in your browser. Eligibility requests send only the listing ID, GPA, and backlog count to the API for comparison; the API does not save those values. {publicUploadNotice}</p><p>The feedback service receives the role, skills, and text you submit. This demo uses built-in checks unless an AI provider is explicitly configured. If Gemini is enabled, the page asks for consent before sending the text to Google. Do not include contact details or sensitive information in feedback.</p></> : <><p>This local portfolio demo has no user accounts or coordinator sign-in. Your student profile is saved in local browser storage. Company, opportunity, and application records are stored by the local FastAPI service in a SQLite database under the project data folder. A submitted PDF or DOCX resume is stored there as a separate file. These records are not sent to an employer or placement office.</p><p>The coordinator screens are available without authentication in this local demo. Anyone who can reach the service can view or change those records. Use fictional data only, keep the service bound to your own computer, and do not expose it to the internet.</p></>}</section>
      <section><h2>AI feedback</h2><p>When the Gemini service is not configured, the built-in review checks the text you submit and does not call an external AI provider. When Gemini is configured, the target role, skills, and resume summary are sent from the server to Google Gemini only after you choose to request feedback and confirm the notice. The portal API does not store review text.</p><p>Do not submit contact details, protected or sensitive personal information, or real applicant records to this portfolio demo. AI suggestions can be incomplete or wrong and should be reviewed by a person.</p></section>
      <section><h2>Analytics and cookies</h2><p>This build does not include advertising trackers, analytics scripts, or third-party review widgets. Browser storage is used for the profile and SQLite plus local files are used for coordinator and application demo data.</p></section>
      <section><h2>Data control</h2><p>{publicDemo ? 'Clear your profile by clearing this site’s browser data. Public test uploads are not available in a coordinator dashboard; the demo removes their records after 24 hours on subsequent activity, and Render may erase them earlier when its free service restarts or spins down.' : 'Clear your profile by clearing this site’s browser data. Remove a submitted demo application from the Applications page to delete its database record and stored resume file. Company and opportunity records can be removed from the Companies page when no applications depend on them. The project owner can reset all demo records by stopping the service and deleting the project data folder.'}</p><p>A future institutional deployment must document its data controller, access rules, retention period, deletion process, and contact channel before collecting real student or employer information.</p></section>
    </div>
  )
}

function TermsContent({ publicDemo, resumeUploadsEnabled }) {
  const publicUploadNotice = resumeUploadsEnabled
    ? 'The public demo accepts test uploads for illustrative opportunities. Use fictional profile details and a sample resume only. Files are stored temporarily for up to 24 hours and may be removed earlier when the free service restarts or spins down. No employer receives the submission.'
    : 'Resume submissions and coordinator records are disabled.'
  return (
    <div className="legal-copy">
      <section><h2>Demo use</h2><p>This portal is a portfolio demonstration. Example opportunity listings are illustrative and are not job offers. This project is not affiliated with a university, employer, or recruitment agency.</p></section>
      <section><h2>Career feedback</h2><p>Resume feedback is educational guidance only. It is not a hiring recommendation, guarantee of employment, or professional career service. Do not use the feedback as the sole basis for a hiring, admission, or placement decision.</p></section>
      <section><h2>Your information</h2><p>{publicDemo ? `Use non-sensitive text in this public demo. Profile and saved roles remain in your browser. ${publicUploadNotice} Feedback text is sent to the demo API and may be processed by Gemini only if enabled and after consent, as described on the privacy page.` : 'Use fictional or non-sensitive information in this demo. The local API stores application details and uploaded resumes on the computer running the server. You are responsible for ensuring that anything you submit is accurate and that you have permission to share it. If Gemini is enabled, the text you choose to review is processed by that provider as described on the privacy page.'}</p></section>
      <section><h2>Public deployment</h2><p>{publicDemo ? 'This public site is a portfolio demonstration with example opportunities, eligibility checks, and resume feedback. It is not a real university placement service, and it does not transmit applications to employers.' : 'This portfolio build does not include identity verification, role-based access control, or protected multi-user data storage. It is not ready to handle real student records or live recruitment applications. A deployment operator must add authentication, permissions, secure file handling, privacy operations, and reviewed policies before real use.'}</p></section>
    </div>
  )
}

function App() {
  const route = window.location.pathname
  if (route === '/privacy') return <LegalPage kind="privacy" />
  if (route === '/terms') return <LegalPage kind="terms" />

  const [section, setSection] = useState('overview')
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...readLocal('placement-portal-profile-v1', {}) }))
  const [opportunities, setOpportunities] = useState(initialLocalOpportunities)
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [portalConnected, setPortalConnected] = useState(false)
  const [publicDemo, setPublicDemo] = useState(false)
  const [resumeUploadsEnabled, setResumeUploadsEnabled] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [eligibilityById, setEligibilityById] = useState({})
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [reviewForm, setReviewForm] = useState(() => ({
    targetRole: profile.targetRole || '',
    skills: profile.skills || '',
    summary: profile.resumeSummary || '',
  }))
  const [reviewResult, setReviewResult] = useState(null)
  const [reviewBusy, setReviewBusy] = useState(false)
  const [geminiEnabled, setGeminiEnabled] = useState(false)
  const [consentToAi, setConsentToAi] = useState(false)

  useEffect(() => { saveLocal('placement-portal-profile-v1', profile) }, [profile])
  async function refreshPortalData() {
    try {
      // Let the status request finish first: on a fresh Render instance it initializes the demo database.
      const statusResponse = await fetch('/api/status')
      if (!statusResponse.ok) throw new Error('Portal API unavailable')
      const statusData = await statusResponse.json()
      const [companyResponse, opportunityResponse] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/opportunities'),
      ])
      if (!companyResponse.ok || !opportunityResponse.ok) throw new Error('Portal API unavailable')
      const [companyData, opportunityData] = await Promise.all([
        companyResponse.json(), opportunityResponse.json(),
      ])
      let applicationData = []
      if (!statusData.public_demo) {
        const applicationResponse = await fetch('/api/applications')
        if (!applicationResponse.ok) throw new Error('Portal API unavailable')
        applicationData = await applicationResponse.json()
      }
      setCompanies(companyData)
      setOpportunities(opportunityData)
      setApplications(applicationData)
      setPublicDemo(Boolean(statusData.public_demo))
      setResumeUploadsEnabled(Boolean(statusData.resume_uploads_enabled))
      setGeminiEnabled(Boolean(statusData.ai_enabled))
      setPortalConnected(true)
      return true
    } catch {
      setCompanies([])
      setOpportunities(initialLocalOpportunities())
      setApplications([])
      setPublicDemo(false)
      setResumeUploadsEnabled(false)
      setGeminiEnabled(false)
      setPortalConnected(false)
      return false
    }
  }

  useEffect(() => {
    let cancelled = false
    let retryTimer
    let retries = 0
    async function connect() {
      const connected = await refreshPortalData()
      if (!connected && !cancelled && retries < 2) {
        retries += 1
        retryTimer = window.setTimeout(connect, 1500 * retries)
      }
    }
    connect()
    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
    }
  }, [])

  const filteredOpportunities = useMemo(() => opportunities.filter((job) => {
    const text = (job.role + ' ' + job.organization + ' ' + job.location + ' ' + (job.skills || []).join(' ')).toLowerCase()
    return text.includes(query.toLowerCase())
  }), [opportunities, query])

  const profileComplete = Boolean(profile.fullName && profile.email && profile.program && profile.graduationYear && profile.targetRole && profile.skills && profile.resumeSummary)
  const pageNames = { overview: 'Overview', companies: 'Company management', opportunities: 'Opportunities', applications: 'Applications', feedback: 'AI feedback', profile: 'Student profile' }

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 4000)
  }

  function goTo(next) {
    if (publicDemo && ['companies', 'applications'].includes(next)) return
    setSection(next)
    setNotice('')
  }

  const visibleNavItems = publicDemo
    ? navItems.filter((item) => !['companies', 'applications'].includes(item.id))
    : navItems

  async function handleApply(job) {
    if (!resumeUploadsEnabled) {
      showNotice('Resume uploads are currently disabled for this site.')
      return
    }
    if (!profile.fullName || !profile.email || !profile.program || !profile.graduationYear) {
      goTo('profile')
      showNotice('Add your name, email, program, and graduation year before uploading a sample resume.')
      return
    }
    if (!portalConnected) {
      showNotice('Start the FastAPI service to submit a resume through the REST API.')
      return
    }
    if (applications.some((application) => application.opportunity_id === job.id)) {
      showNotice('You already submitted a resume for this opportunity in the local demo.')
      return
    }
    let eligibility = eligibilityById[job.id]
    if (!eligibility || !['eligible', 'criteria_not_set'].includes(eligibility.status)) {
      eligibility = await checkEligibility(job)
      if (!eligibility) return
    }
    if (eligibility.status === 'needs_information') {
      goTo('profile')
      showNotice('Add the GPA and active backlog details requested for this role, save your profile, then try the upload again.')
      return
    }
    if (eligibility.status === 'not_eligible') {
      showNotice('This sample role’s criteria are not met. Review the result or choose another role.')
      return
    }
    setSelectedOpportunity(job)
  }

  async function checkEligibility(job) {
    if (!portalConnected) {
      showNotice('Start the FastAPI service to check the criteria through the REST API.')
      return
    }
    const payload = {
      opportunity_id: job.id,
      gpa: profile.gpa === '' ? null : Number(profile.gpa),
      active_backlogs: profile.activeBacklogs === '' ? null : Number(profile.activeBacklogs),
    }
    try {
      const response = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Eligibility check failed')
      setEligibilityById((current) => ({ ...current, [job.id]: result }))
      return result
    } catch (error) {
      showNotice(typeof error.message === 'string' ? error.message : 'Could not check eligibility.')
      return null
    }
  }

  async function removeApplication(id) {
    try {
      const response = await fetch('/api/applications/' + encodeURIComponent(id), { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not remove this local submission.')
      await refreshPortalData()
      showNotice('Local application record and stored resume removed.')
    } catch (error) {
      showNotice(error.message || 'Could not remove this local submission.')
    }
  }

  async function updateApplicationStatus(id, status) {
    try {
      const response = await fetch('/api/applications/' + encodeURIComponent(id) + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.detail || 'Could not update the local status.')
      await refreshPortalData()
      showNotice('Application status updated in the local demo. No candidate was notified.')
    } catch (error) { showNotice(error.message || 'Could not update the local status.') }
  }

  async function submitResume(formData) {
    const response = await fetch('/api/resume-submissions', { method: 'POST', body: formData })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      const detail = result.detail
      const message = typeof detail === 'string' ? detail : detail?.message || 'Resume submission failed.'
      throw new Error(message)
    }
    setSelectedOpportunity(null)
    if (publicDemo) {
      showNotice('Test resume received. It is not sent to an employer and may be deleted within 24 hours or sooner.')
    } else {
      await refreshPortalData()
      goTo('applications')
      showNotice('Resume received by the local demo server. No employer was contacted.')
    }
  }

  function syncProfileToReview(source = profile) {
    setReviewForm({ targetRole: source.targetRole, skills: source.skills, summary: source.resumeSummary })
    setReviewResult(null)
    goTo('feedback')
  }

  async function requestReview(event) {
    event.preventDefault()
    if (reviewForm.summary.trim().length < 30) {
      showNotice('Add at least a few sentences so the review has evidence to work with.')
      return
    }
    if (geminiEnabled && !consentToAi) {
      showNotice('Confirm the Gemini data notice before sending this text for AI feedback.')
      return
    }
    setReviewBusy(true)
    setReviewResult(null)
    const payload = { target_role: reviewForm.targetRole.trim(), skills: reviewForm.skills.trim(), summary: reviewForm.summary.trim(), consent_to_ai: consentToAi }
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Feedback service unavailable')
      setReviewResult(await response.json())
    } catch {
      setReviewResult(localReview(reviewForm))
    } finally {
      setReviewBusy(false)
    }
  }

  const reviewLabel = reviewResult?.source === 'gemini' ? 'Gemini AI feedback' : 'Built-in review'

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Placement Portal home">
          <span className="brand-mark"><span>P</span></span>
          <span className="brand-copy"><strong>Placement</strong><small>Management Portal</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <button key={item.id} className={'nav-item' + (section === item.id ? ' nav-item--active' : '')} onClick={() => goTo(item.id)} aria-current={section === item.id ? 'page' : undefined}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>
              {item.id === 'applications' && applications.length > 0 && <span className="nav-count">{applications.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={'nav-item' + (section === 'profile' ? ' nav-item--active' : '')} onClick={() => goTo('profile')}>
            <Icon name="profile" size={19} /><span>Student profile</span>
          </button>
          <div className="sidebar-rule" />
          <p className="sidebar-note">{publicDemo ? (resumeUploadsEnabled ? 'Public portfolio demo. Test uploads only; records are temporary and coordinator access is disabled.' : 'Public portfolio demo. Listings are examples; resume submissions and coordinator records are disabled.') : 'Local demo only. Coordinator screens have no sign-in. Do not enter real student records.'}</p>
          <div className="sidebar-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>Student workspace</span><span className="breadcrumb-separator">/</span><strong>{pageNames[section]}</strong></div>
          <div className="topbar-actions">
            <span className="environment-label">{publicDemo ? 'PUBLIC DEMO' : portalConnected ? 'LOCAL DEMO' : 'API OFFLINE'}</span>
            <button className="profile-shortcut" onClick={() => goTo('profile')} aria-label="Open student profile"><span className="avatar">{profile.fullName ? profile.fullName.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'ST'}</span></button>
          </div>
        </header>

        <main id="main-content" className="content-area">
          {section === 'overview' && <Overview profile={profile} profileComplete={profileComplete} applications={applications} companies={companies} opportunities={opportunities} publicDemo={publicDemo} resumeUploadsEnabled={resumeUploadsEnabled} geminiEnabled={geminiEnabled} portalConnected={portalConnected} onNavigate={goTo} onUpload={handleApply} onReview={syncProfileToReview} onRetry={refreshPortalData} />}
          {section === 'companies' && <CompanyManagement companies={companies} opportunities={opportunities} onRefresh={refreshPortalData} onNotice={showNotice} connected={portalConnected} />}
          {section === 'opportunities' && <Opportunities query={query} setQuery={setQuery} roles={filteredOpportunities} applications={applications} eligibilityById={eligibilityById} onCheck={checkEligibility} onApply={handleApply} connected={portalConnected} publicDemo={publicDemo} resumeUploadsEnabled={resumeUploadsEnabled} />}
          {section === 'applications' && <Applications items={applications} onRemove={removeApplication} onStatusChange={updateApplicationStatus} onBrowse={() => goTo('opportunities')} connected={portalConnected} />}
          {section === 'profile' && <Profile profile={profile} setProfile={setProfile} onReview={syncProfileToReview} onSaved={() => showNotice('Profile saved in this browser.')} />}
          {section === 'feedback' && <Feedback form={reviewForm} setForm={setReviewForm} onSubmit={requestReview} busy={reviewBusy} result={reviewResult} label={reviewLabel} geminiEnabled={geminiEnabled} consent={consentToAi} setConsent={setConsentToAi} />}
        </main>

        <footer className="page-footer"><span>Placement Management Portal · Portfolio demonstration</span><span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span></footer>
      </div>
      {notice && <div className="notice" role="status"><Icon name="check" size={17} />{notice}</div>}
      {selectedOpportunity && <ApplicationDialog job={selectedOpportunity} profile={profile} publicDemo={publicDemo} onClose={() => setSelectedOpportunity(null)} onSubmit={submitResume} />}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>
}

function Overview({ profile, profileComplete, applications, companies, opportunities, publicDemo, resumeUploadsEnabled, geminiEnabled, portalConnected, onNavigate, onUpload, onReview, onRetry }) {
  const [selectedRoleId, setSelectedRoleId] = useState(opportunities[0]?.id || '')
  const firstName = profile.fullName.trim().split(/\s+/)[0]
  const submitted = applications.length
  const offers = applications.filter((application) => application.status === 'Offer').length
  return (
    <>
      <PageHeading eyebrow={publicDemo ? 'PUBLIC PORTFOLIO DEMO' : 'STUDENT WORKSPACE'} title={firstName ? 'Welcome, ' + firstName : 'Your placement workspace'} description={publicDemo ? (resumeUploadsEnabled ? 'Explore example roles, test a resume upload with fictional details, and get focused feedback. Demo uploads are temporary.' : 'Explore illustrative roles, try the eligibility checks, and get focused resume feedback. Your profile stays in this browser.') : 'Review opportunities, keep track of applications you saved, and get focused suggestions for your next application.'} />
      {!portalConnected && <div className="portal-connection-warning" role="status"><span>The portal service may be waking after inactivity. Reconnect to load opportunities and enable uploads.</span><button className="button button--secondary" onClick={onRetry}>Retry connection</button></div>}
      <div className="status-banner">
        <div className="status-banner-icon"><Icon name={profileComplete ? 'check' : 'profile'} size={20} /></div>
        <div className="status-banner-copy"><strong>{profileComplete ? 'Your profile is ready for a review' : 'Start with your student profile'}</strong><span>{profileComplete ? 'Use your role, skills, and resume summary to get specific improvement suggestions.' : 'Add your study program and target role to make the workspace useful.'}</span></div>
        <button className="button button--secondary" onClick={() => profileComplete ? onReview() : onNavigate('profile')}>{profileComplete ? 'Review my resume' : 'Complete profile'}<Icon name="arrow" size={16} /></button>
      </div>
      <section className="panel resume-tools-panel" aria-label="Resume tools">
        <div className="panel-heading"><div><p className="eyebrow">RESUME TOOLS</p><h2>Upload a resume or review your summary</h2></div></div>
        <div className="resume-tool-grid">
          <div className="resume-tool-card">
            <span className="action-icon"><Icon name="document" size={19} /></span>
            <div className="resume-tool-copy"><strong>{publicDemo ? 'Upload a sample resume' : 'Upload a resume'}</strong><p>{resumeUploadsEnabled ? 'Choose a role. The portal checks its example criteria, then opens the file form.' : 'Resume uploads are currently unavailable on this site.'}</p></div>
            {resumeUploadsEnabled && <div className="resume-tool-controls"><label className="sr-only" htmlFor="overview-upload-role">Choose a role for your resume</label><select id="overview-upload-role" className="inline-select resume-role-select" value={opportunities.some((job) => job.id === selectedRoleId) ? selectedRoleId : opportunities[0]?.id || ''} onChange={(event) => setSelectedRoleId(event.target.value)} disabled={opportunities.length === 0}><option value="" disabled>Select a role</option>{opportunities.map((job) => <option key={job.id} value={job.id}>{job.role}</option>)}</select><button className="button button--primary" onClick={() => { const job = opportunities.find((item) => item.id === selectedRoleId) || opportunities[0]; if (job) onUpload(job) }} disabled={!opportunities.length}>Upload {publicDemo ? 'test ' : ''}resume</button></div>}
            <small className="resume-tool-note">{publicDemo ? 'Use fictional details and a sample PDF or DOCX only. Test files are temporary and are not sent to employers.' : 'PDF or DOCX, up to 5 MB. This demo does not contact employers.'}</small>
          </div>
          <div className="resume-tool-card resume-tool-card--feedback">
            <span className="action-icon"><Icon name="feedback" size={19} /></span>
            <div className="resume-tool-copy"><strong>Review my summary</strong><p>Get strengths and practical suggestions for your resume summary. You can use the summary saved in your profile.</p></div>
            <div className="resume-tool-controls"><button className="button button--secondary" onClick={() => onReview(profile)}>Open AI feedback<Icon name="arrow" size={15} /></button></div>
            <small className="resume-tool-note">Feedback reviews summary text; uploading a PDF does not automatically extract its text.</small>
          </div>
        </div>
      </section>
      <section className="overview-grid" aria-label="Workspace summary">
        {publicDemo ? <>
          <article className="summary-card"><div className="summary-label">ILLUSTRATIVE ROLES</div><div className="summary-value">{opportunities.length}</div><p>Sample listings for trying the portal</p></article>
          <article className="summary-card"><div className="summary-label">PROFILE</div><div className="summary-value">{profileComplete ? 'Ready' : 'Optional'}</div><p>Saved in this browser only</p></article>
          <article className="summary-card"><div className="summary-label">RESUME FEEDBACK</div><div className="summary-value">{geminiEnabled ? 'AI' : 'Built-in'}</div><p>{geminiEnabled ? 'AI review is available with consent' : 'Private built-in checks are active'}</p></article>
        </> : <>
          <article className="summary-card"><div className="summary-label">APPLICATIONS</div><div className="summary-value">{submitted}</div><p>{submitted === 1 ? 'resume stored in the local demo' : 'resumes stored in the local demo'}</p></article>
          <article className="summary-card"><div className="summary-label">COMPANIES</div><div className="summary-value">{companies.length}</div><p>Company records in the local database</p></article>
          <article className="summary-card"><div className="summary-label">OPPORTUNITIES</div><div className="summary-value">{opportunities.length}</div><p>Listings currently available in this demo</p></article>
          <article className="summary-card"><div className="summary-label">OFFERS</div><div className="summary-value">{offers}</div><p>Applications marked as offers in this demo</p></article>
        </>}
      </section>
      <div className="overview-columns">
        <section className="panel next-steps-panel">
          <div className="panel-heading"><div><p className="eyebrow">NEXT STEPS</p><h2>Move your preparation forward</h2></div></div>
          <button className="action-row" onClick={() => onNavigate('opportunities')}><span className="action-icon"><Icon name="roles" size={19} /></span><span className="action-copy"><strong>{publicDemo ? 'Explore example opportunities' : 'Explore opportunities'}</strong><small>{publicDemo ? 'Review sample requirements and try an eligibility check.' : 'Review eligibility criteria and submit a resume to a local demo listing.'}</small></span><Icon name="arrow" size={17} /></button>
          {!publicDemo && <button className="action-row" onClick={() => onNavigate('companies')}><span className="action-icon"><Icon name="roles" size={19} /></span><span className="action-copy"><strong>Manage companies and roles</strong><small>Add fictional employers and their opportunity requirements.</small></span><Icon name="arrow" size={17} /></button>}
          <button className="action-row" onClick={() => onNavigate('profile')}><span className="action-icon"><Icon name="profile" size={19} /></span><span className="action-copy"><strong>Keep your profile current</strong><small>Add skills you can explain with examples.</small></span><Icon name="arrow" size={17} /></button>
          <button className="action-row" onClick={() => onReview(profile)}><span className="action-icon"><Icon name="feedback" size={19} /></span><span className="action-copy"><strong>Get focused resume feedback</strong><small>See strengths and specific areas to improve.</small></span><Icon name="arrow" size={17} /></button>
        </section>
        <section className="panel activity-panel">
          {publicDemo ? <>
            <div className="panel-heading"><div><p className="eyebrow">TRY THE PORTAL</p><h2>Practice before applying</h2></div></div>
            <div className="empty-state empty-state--compact"><span className="empty-icon"><Icon name="shield" size={21} /></span><strong>{resumeUploadsEnabled ? 'Test uploads only' : 'No real applications are sent'}</strong><p>{resumeUploadsEnabled ? 'Use the resume tools above with fictional details and a sample file. Uploads are temporary and are not sent to employers.' : 'Listings are illustrative. This public demo does not accept resumes or create coordinator records.'}</p><button className="text-button" onClick={() => onReview(profile)}>Try resume feedback <Icon name="arrow" size={15} /></button></div>
          </> : <>
            <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Resume submissions</h2></div><button className="text-button" onClick={() => onNavigate('applications')}>View all</button></div>
            {applications.length === 0 ? <div className="empty-state empty-state--compact"><span className="empty-icon"><Icon name="applications" size={21} /></span><strong>No resumes submitted</strong><p>Eligible applications you submit in this demo will appear here. No employer is contacted.</p><button className="text-button" onClick={() => onNavigate('opportunities')}>Browse opportunities <Icon name="arrow" size={15} /></button></div> : <div className="mini-app-list">{applications.slice(0, 4).map((item) => <div className="mini-app" key={item.id}><span className="mini-app-mark"><Icon name="document" size={17} /></span><span><strong>{item.role}</strong><small>{item.organization} · {new Date(item.submitted_at).toLocaleDateString()}</small></span><span className="status-chip">{item.status}</span></div>)}</div>}
          </>}
        </section>
      </div>
      <p className="demo-caption"><Icon name="shield" size={15} />{publicDemo ? (resumeUploadsEnabled ? 'Use fictional profile details and a sample file. Demo uploads are temporary and no employer receives them.' : 'Example listings are marked. Profile information stays in this browser; resume uploads are disabled.') : 'Example listings are marked. No real applications are sent from this portfolio build.'}</p>
    </>
  )
}

function Opportunities({ query, setQuery, roles, applications, eligibilityById, onCheck, onApply, connected, publicDemo, resumeUploadsEnabled }) {
  return (
    <>
      <PageHeading eyebrow="ROLE EXPLORER" title="Opportunities" description={publicDemo ? (resumeUploadsEnabled ? 'Choose Upload test resume to check the example criteria and open the upload form when they are met. Use a sample file only.' : 'Browse illustrative roles and try the eligibility checks. These sample listings do not accept applications.') : "Choose Submit resume to check each listing's stated criteria and open the local upload form when they are met."} />
      {publicDemo && resumeUploadsEnabled && <div className="inline-warning demo-upload-warning">Test uploads only: use fictional profile details and a sample PDF or DOCX. Files are kept for up to 24 hours and may be removed sooner if Render restarts the free service. The demo does not forward applications to employers or provide coordinator access.</div>}
      <div className="search-toolbar"><label className="search-box"><Icon name="search" size={19} /><input aria-label="Search opportunities" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search role, skill, or location" /></label><span className="result-count">{roles.length} {roles.length === 1 ? 'listing' : 'listings'}</span></div>
      {roles.length === 0 ? <div className="panel empty-state"><span className="empty-icon"><Icon name="search" size={22} /></span><h2>No matching listings</h2><p>Try another role title, skill, or location.</p></div> : <div className="opportunity-list">{roles.map((job) => {
        const alreadyApplied = applications.some((application) => application.opportunity_id === job.id)
        const eligibility = eligibilityById[job.id]
        return <article className="opportunity-card" key={job.id}>
          <div className="opportunity-heading"><div className="employer-mark">{job.organization.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</div><div className="opportunity-title"><div className="title-line"><h2>{job.role}</h2><span className="example-tag">{job.example ? 'ILLUSTRATIVE' : 'LOCAL DEMO'}</span></div><p>{job.organization}</p></div><span className="role-type">{job.type}</span></div>
          <p className="opportunity-description">{job.description}</p>
          <div className="opportunity-meta"><span><Icon name="pin" size={16} />{job.location}</span><span><Icon name="calendar" size={16} />{job.type}</span></div>
          <div className="skill-tags">{job.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div>
          {(job.minimum_gpa != null || job.maximum_backlogs != null) && <p className="criteria-line">{job.minimum_gpa != null ? 'Minimum GPA ' + Number(job.minimum_gpa).toFixed(1) : ''}{job.minimum_gpa != null && job.maximum_backlogs != null ? ' · ' : ''}{job.maximum_backlogs != null ? 'Maximum ' + job.maximum_backlogs + ' active backlogs' : ''}</p>}
          {eligibility && <div className={'eligibility-result eligibility-result--' + eligibility.status}><strong>{eligibility.status.replaceAll('_', ' ')}</strong>{eligibility.reasons.map((reason, index) => <span key={index}>{reason}</span>)}</div>}
          <div className="opportunity-actions"><span className="privacy-inline"><Icon name="shield" size={15} />{publicDemo ? 'Illustrative listing' : 'Local demo only'}</span><div className="opportunity-action-buttons"><button className="button button--secondary" onClick={() => onCheck(job)} disabled={!connected}>Check eligibility</button>{(!publicDemo || resumeUploadsEnabled) && <button className={'button ' + (alreadyApplied ? 'button--saved' : 'button--primary')} onClick={() => onApply(job)} disabled={alreadyApplied || !connected}>{alreadyApplied ? 'Resume received' : publicDemo ? 'Upload test resume' : 'Submit resume'}</button>}</div></div>
        </article>
      })}</div>}
      <p className="disclaimer-note">These example listings are for demonstration only. Replace them with verified postings before using this portal with students.</p>
    </>
  )
}

function Applications({ items, onRemove, onStatusChange, onBrowse, connected }) {
  return (
    <>
      <PageHeading eyebrow="RECRUITMENT WORKSPACE" title="Applications and status" description="Review resume submissions in the local API and update their demo status. Changes do not notify candidates." action={<button className="button button--secondary" onClick={onBrowse}>Browse roles<Icon name="arrow" size={16} /></button>} />
      {!connected && <div className="inline-warning">The API is offline. Start the local FastAPI service to load or remove submission records.</div>}
      {items.length === 0 ? <div className="panel empty-state"><span className="empty-icon"><Icon name="applications" size={22} /></span><h2>No resume submissions</h2><p>Submit a resume to an eligible opportunity to see its local status here.</p><button className="button button--primary" onClick={onBrowse}>Browse opportunities</button></div> : <div className="panel application-table-wrap"><div className="table-heading"><span>ROLE / CANDIDATE</span><span>ORGANIZATION</span><span>SUBMITTED</span><span>STATUS</span><span></span></div>{items.map((application) => <div className="application-row" key={application.id}><div><strong>{application.role}</strong><small>{application.full_name} · {application.program}</small><small>{application.resume_name}</small></div><span>{application.organization}</span><span>{new Date(application.submitted_at).toLocaleDateString()}</span><span><select className="inline-select" value={application.status} onChange={(event) => onStatusChange(application.id, event.target.value)} disabled={!connected} aria-label={'Status for ' + application.full_name}><option>Received in local demo</option><option>Under review</option><option>Interview</option><option>Offer</option><option>Not selected</option></select></span><button className="icon-button remove-button" onClick={() => onRemove(application.id)} disabled={!connected} aria-label={'Delete local submission for ' + application.full_name}><Icon name="close" size={18} /></button></div>)}</div>}
    </>
  )
}

function Profile({ profile, setProfile, onReview, onSaved }) {
  const [draft, setDraft] = useState(profile)
  function update(field, value) { setDraft((current) => ({ ...current, [field]: value })) }
  function submit(event) {
    event.preventDefault()
    setProfile(draft)
    onSaved()
  }
  return (
    <>
      <PageHeading eyebrow="STUDENT DETAILS" title="Student profile" description="Your profile is saved in this browser. GPA and backlog details are used only when you check a listing's example eligibility criteria." action={<ProfileProgress profile={draft} />} />
      <form className="panel profile-form" onSubmit={submit}>
        <div className="form-section-heading"><div><h2>Basic information</h2><p>Used to personalize your workspace. It is not submitted with AI feedback.</p></div></div>
        <div className="form-grid"><Field label="Full name" value={draft.fullName} onChange={(value) => update('fullName', value)} placeholder="Your name" autoComplete="name" /><Field label="Email" value={draft.email} onChange={(value) => update('email', value)} placeholder="you@example.com" type="email" autoComplete="email" /><Field label="Program or degree" value={draft.program} onChange={(value) => update('program', value)} placeholder="For example, B.Tech Computer Science" /><Field label="Graduation year" value={draft.graduationYear} onChange={(value) => update('graduationYear', value)} placeholder="2027" inputMode="numeric" /><Field label="GPA (optional, on a 10-point scale)" value={draft.gpa} onChange={(value) => update('gpa', value)} placeholder="For example, 8.2" type="number" inputMode="decimal" min="0" max="10" step="0.1" /><Field label="Active backlogs (optional)" value={draft.activeBacklogs} onChange={(value) => update('activeBacklogs', value)} placeholder="For example, 0" type="number" inputMode="numeric" min="0" max="20" step="1" /></div>
        <div className="form-section-heading form-section-heading--second"><div><h2>Career focus</h2><p>Use specific, accurate details that you can support.</p></div></div>
        <Field label="Target role" value={draft.targetRole} onChange={(value) => update('targetRole', value)} placeholder="For example, Frontend Developer" />
        <Field label="Relevant skills" value={draft.skills} onChange={(value) => update('skills', value)} placeholder="React, JavaScript, API testing" hint="Separate skills with commas. List only skills you have used." />
        <Field label="Resume summary or experience excerpt" value={draft.resumeSummary} onChange={(value) => update('resumeSummary', value)} placeholder="Describe a project, coursework, or experience. Include your contribution and tools used." multiline hint="This text stays in this browser until you request a review. Do not include phone numbers, addresses, or sensitive information." />
        <div className="form-actions"><button type="submit" className="button button--primary">Save profile</button><button type="button" className="text-button" onClick={() => onReview(draft)}>Go to AI feedback <Icon name="arrow" size={16} /></button></div>
      </form>
    </>
  )
}

function CompanyManagement({ companies, opportunities, onRefresh, onNotice, connected }) {
  const [companyForm, setCompanyForm] = useState({ name: '', website: '', description: '' })
  const [roleForm, setRoleForm] = useState({ company_id: '', role: '', location: '', employment_type: 'Internship', skills: '', description: '', minimum_gpa: '', maximum_backlogs: '' })
  const [busy, setBusy] = useState(false)

  async function send(path, method, body) {
    const response = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const result = response.status === 204 ? null : await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result?.detail || 'The local API request failed.')
    return result
  }

  async function addCompany(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const created = await send('/api/companies', 'POST', companyForm)
      setCompanyForm({ name: '', website: '', description: '' })
      setRoleForm((form) => ({ ...form, company_id: form.company_id || created.id }))
      await onRefresh()
      onNotice('Company added to the local demo database.')
    } catch (error) { onNotice(error.message) } finally { setBusy(false) }
  }

  async function addOpportunity(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await send('/api/opportunities', 'POST', {
        company_id: roleForm.company_id,
        role: roleForm.role,
        location: roleForm.location,
        employment_type: roleForm.employment_type,
        skills: roleForm.skills.split(/,|\n/).map((skill) => skill.trim()).filter(Boolean),
        description: roleForm.description,
        minimum_gpa: roleForm.minimum_gpa === '' ? null : Number(roleForm.minimum_gpa),
        maximum_backlogs: roleForm.maximum_backlogs === '' ? null : Number(roleForm.maximum_backlogs),
      })
      setRoleForm((form) => ({ ...form, role: '', location: '', skills: '', description: '', minimum_gpa: '', maximum_backlogs: '' }))
      await onRefresh()
      onNotice('Opportunity added. Students can now check its criteria in this local demo.')
    } catch (error) { onNotice(error.message) } finally { setBusy(false) }
  }

  async function removeCompany(company) {
    if (!window.confirm('Delete ' + company.name + '? Companies with opportunities cannot be removed.')) return
    try { await send('/api/companies/' + encodeURIComponent(company.id), 'DELETE'); await onRefresh(); onNotice('Company removed.') }
    catch (error) { onNotice(error.message) }
  }

  async function removeOpportunity(opportunity) {
    if (!window.confirm('Delete the ' + opportunity.role + ' listing?')) return
    try { await send('/api/opportunities/' + encodeURIComponent(opportunity.id), 'DELETE'); await onRefresh(); onNotice('Opportunity removed.') }
    catch (error) { onNotice(error.message) }
  }

  return (
    <>
      <PageHeading eyebrow="COORDINATOR WORKSPACE" title="Company management" description="Maintain company records and opportunity criteria through the local REST API. These controls have no sign-in, so keep this demo on your own computer and use fictional records." action={<span className="status-chip">{connected ? 'Local API connected' : 'API offline'}</span>} />
      {!connected && <div className="inline-warning">Start the FastAPI service to create or manage records.</div>}
      <div className="management-grid">
        <form className="panel management-form" onSubmit={addCompany}>
          <div className="form-section-heading"><div><h2>Add a company</h2><p>Use an illustrative name for portfolio demonstrations.</p></div><span className="step-number">01</span></div>
          <Field label="Company name" value={companyForm.name} onChange={(value) => setCompanyForm((form) => ({ ...form, name: value }))} placeholder="Example employer" />
          <Field label="Website (optional)" value={companyForm.website} onChange={(value) => setCompanyForm((form) => ({ ...form, website: value }))} placeholder="https://example.com" type="url" />
          <Field label="Description" value={companyForm.description} onChange={(value) => setCompanyForm((form) => ({ ...form, description: value }))} placeholder="Short company description" />
          <button className="button button--primary" type="submit" disabled={!connected || busy}>Add company</button>
        </form>
        <form className="panel management-form" onSubmit={addOpportunity}>
          <div className="form-section-heading"><div><h2>Add an opportunity</h2><p>Set optional GPA and active backlog requirements.</p></div><span className="step-number">02</span></div>
          <div className="field"><label htmlFor="company-selection">Company</label><select id="company-selection" required value={roleForm.company_id} onChange={(event) => setRoleForm((form) => ({ ...form, company_id: event.target.value }))}><option value="">Choose a company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></div>
          <Field label="Role title" value={roleForm.role} onChange={(value) => setRoleForm((form) => ({ ...form, role: value }))} placeholder="Software Engineering Intern" />
          <div className="form-grid form-grid--compact"><Field label="Location" value={roleForm.location} onChange={(value) => setRoleForm((form) => ({ ...form, location: value }))} placeholder="Remote or city" /><div className="field"><label htmlFor="employment-type">Employment type</label><select id="employment-type" value={roleForm.employment_type} onChange={(event) => setRoleForm((form) => ({ ...form, employment_type: event.target.value }))}><option>Internship</option><option>Full time</option><option>Entry level</option><option>Co-op</option></select></div></div>
          <div className="form-grid form-grid--compact"><Field label="Minimum GPA (optional)" value={roleForm.minimum_gpa} onChange={(value) => setRoleForm((form) => ({ ...form, minimum_gpa: value }))} placeholder="7.0" type="number" inputMode="decimal" min="0" max="10" step="0.1" /><Field label="Maximum active backlogs (optional)" value={roleForm.maximum_backlogs} onChange={(value) => setRoleForm((form) => ({ ...form, maximum_backlogs: value }))} placeholder="0" type="number" inputMode="numeric" min="0" max="20" step="1" /></div>
          <Field label="Skills" value={roleForm.skills} onChange={(value) => setRoleForm((form) => ({ ...form, skills: value }))} placeholder="React, JavaScript, CSS" hint="Separate skills with commas." />
          <Field label="Role description" value={roleForm.description} onChange={(value) => setRoleForm((form) => ({ ...form, description: value }))} placeholder="Describe the work and expectations." multiline />
          <button className="button button--primary" type="submit" disabled={!connected || busy || companies.length === 0}>Add opportunity</button>
          {companies.length === 0 && <p className="form-footnote">Add a company before creating its opportunity.</p>}
        </form>
      </div>
      <section className="panel records-panel">
        <div className="panel-heading"><div><p className="eyebrow">LOCAL RECORDS</p><h2>Companies and opportunities</h2></div><span className="status-chip">{companies.length} companies · {opportunities.length} opportunities</span></div>
        {companies.length === 0 ? <div className="empty-state"><h2>No companies available</h2><p>Add a company above to start creating opportunities.</p></div> : <div className="company-list">{companies.map((company) => <article className="company-record" key={company.id}>
          <div className="company-record-heading"><div><h3>{company.name}</h3><p>{company.description || 'No description provided.'}{company.website ? <> · <a href={company.website} target="_blank" rel="noreferrer">Company website</a></> : null}</p></div><div className="company-record-actions"><span className="status-chip">{company.opportunity_count} roles</span>{company.name !== 'Example employer' && <button className="text-button text-button--danger" onClick={() => removeCompany(company)}>Delete</button>}</div></div>
          {opportunities.filter((opportunity) => opportunity.company_id === company.id).map((opportunity) => <div className="managed-opportunity" key={opportunity.id}><div><strong>{opportunity.role}</strong><small>{opportunity.location} · {opportunity.type}{opportunity.minimum_gpa != null ? ' · GPA ' + Number(opportunity.minimum_gpa).toFixed(1) + '+' : ''}{opportunity.maximum_backlogs != null ? ' · Backlogs ≤ ' + opportunity.maximum_backlogs : ''}</small></div>{!opportunity.example && <button className="text-button text-button--danger" onClick={() => removeOpportunity(opportunity)}>Delete</button>}</div>)}
        </article>)}</div>}
      </section>
    </>
  )
}

function ApplicationDialog({ job, profile, publicDemo, onClose, onSubmit }) {
  const [resume, setResume] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [testOnlyConfirmed, setTestOnlyConfirmed] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!resume) { setError('Choose a PDF or DOCX resume.'); return }
    if (publicDemo && !testOnlyConfirmed) { setError('Confirm that you are using fictional details and a sample file.'); return }
    setBusy(true)
    setError('')
    const body = new FormData()
    body.set('opportunity_id', job.id)
    body.set('full_name', profile.fullName)
    body.set('email', profile.email)
    body.set('program', profile.program)
    body.set('graduation_year', profile.graduationYear)
    if (profile.gpa !== '') body.set('gpa', profile.gpa)
    if (profile.activeBacklogs !== '') body.set('active_backlogs', profile.activeBacklogs)
    body.set('resume', resume)
    try { await onSubmit(body) } catch (submissionError) { setError(submissionError.message || 'Resume submission failed.') } finally { setBusy(false) }
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}><section className="submission-dialog" role="dialog" aria-modal="true" aria-labelledby="submission-title"><button className="dialog-close icon-button" onClick={onClose} aria-label="Close" disabled={busy}><Icon name="close" size={19} /></button><p className="eyebrow">{publicDemo ? 'PUBLIC TEST UPLOAD' : 'LOCAL DEMO SUBMISSION'}</p><h2 id="submission-title">{publicDemo ? 'Upload a sample resume for ' : 'Submit resume for '}{job.role}</h2><p className="dialog-copy">{publicDemo ? 'This public demo stores the test file temporarily for up to 24 hours; Render may remove it sooner when the free service restarts. Use fictional profile details and a sample file only. It is not sent to an employer or available in a coordinator dashboard.' : job.organization + '. Your file will be stored on the computer running this demo. No employer will be contacted.'}</p><form onSubmit={submit}><div className="file-drop"><label htmlFor="resume-file">Resume file</label><input id="resume-file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { setResume(event.target.files?.[0] || null); setError('') }} required /><small>PDF or DOCX, up to 5 MB.</small></div><p className="submission-person">Submitting as <strong>{profile.fullName}</strong><br />{profile.program} · Class of {profile.graduationYear}</p>{publicDemo && <label className="demo-upload-consent"><input type="checkbox" checked={testOnlyConfirmed} onChange={(event) => setTestOnlyConfirmed(event.target.checked)} /><span>I will use fictional profile details and a sample resume. I understand this is a temporary test submission and is not sent to employers.</span></label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button type="button" className="button button--secondary" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" className="button button--primary" disabled={busy || (publicDemo && !testOnlyConfirmed)}>{busy ? 'Submitting…' : publicDemo ? 'Send test resume' : 'Submit to local demo'}</button></div></form></section></div>
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline = false, hint, autoComplete, inputMode, min, max, step }) {
  const id = 'field-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return <div className={'field' + (multiline ? ' field--wide' : '')}><label htmlFor={id}>{label}</label>{multiline ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={6} maxLength={8000} /> : <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} min={min} max={max} step={step} maxLength={type === 'number' ? undefined : 120} />}{hint && <small>{hint}</small>}</div>
}

function Feedback({ form, setForm, onSubmit, busy, result, label, geminiEnabled, consent, setConsent }) {
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })) }
  return (
    <>
      <PageHeading eyebrow="CAREER PREPARATION" title="AI resume feedback" description="Get specific suggestions for one target role. The review highlights evidence to strengthen and practical next steps. It does not score or rank people." />
      <div className="feedback-layout">
        <form className="panel feedback-form" onSubmit={onSubmit}>
          <div className="form-section-heading"><div><h2>Your review input</h2><p>Share only the text you want reviewed.</p></div><span className="step-number">01</span></div>
          <Field label="Target role" value={form.targetRole} onChange={(value) => update('targetRole', value)} placeholder="For example, QA Automation Intern" />
          <Field label="Relevant skills" value={form.skills} onChange={(value) => update('skills', value)} placeholder="Python, API testing, Git" hint="List skills that appear in the summary or project details." />
          <Field label="Resume summary or experience excerpt" value={form.summary} onChange={(value) => update('summary', value)} placeholder="Paste a short, non-sensitive section. Mention what you did, the tools you used, and any verifiable outcome." multiline hint={form.summary.length + ' / 8,000 characters'} />
          {geminiEnabled ? <label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I understand this role, skill list, and summary will be sent to Google Gemini for feedback. I have removed personal and sensitive information.</span></label> : <div className="provider-note"><Icon name="shield" size={17} /><span><strong>Built-in review is active.</strong> Gemini is not configured, so this request uses local checks and no external AI provider.</span></div>}
          <button className="button button--primary button--full" type="submit" disabled={busy}>{busy ? 'Reviewing text…' : 'Review my summary'}<Icon name="arrow" size={16} /></button>
          <p className="form-footnote">Feedback is educational guidance. Review each suggestion and keep claims accurate.</p>
        </form>
        <section className="panel feedback-results" aria-live="polite" aria-busy={busy}>
          {!result && !busy && <div className="feedback-empty"><span className="empty-icon"><Icon name="feedback" size={22} /></span><p className="eyebrow">YOUR REVIEW</p><h2>Feedback will appear here</h2><p>Submit a role and a short resume excerpt to see strengths, improvement points, and suggested next steps.</p><div className="result-guide"><strong>What the review checks</strong><span>Role relevance</span><span>Specific examples</span><span>Evidence for listed skills</span><span>Clear, truthful outcomes</span></div></div>}
          {busy && <div className="feedback-empty"><span className="loading-mark"><Icon name="feedback" size={22} /></span><p className="eyebrow">REVIEWING</p><h2>Reading your summary</h2><p>The review checks the text you submitted. It does not make a hiring decision.</p></div>}
          {result && <div className="result-content"><div className="result-heading"><div><p className="eyebrow">REVIEW COMPLETE</p><h2>Suggestions for your next revision</h2></div><span className="source-tag">{label}</span></div><p className="result-overview">{result.overview}</p><section className="result-section"><h3>Strengths to keep</h3><ul className="strength-list">{(result.strengths || []).map((item, index) => <li key={index}><Icon name="check" size={17} /><span>{item}</span></li>)}</ul></section><section className="result-section"><h3>Focus areas</h3><div className="focus-list">{(result.focus_areas || []).map((item, index) => <article className="focus-card" key={index}><span className="focus-index">0{index + 1}</span><div><h4>{item.title}</h4><p className="focus-evidence">{item.evidence}</p><p><strong>Try this:</strong> {item.action}</p></div></article>)}</div></section><section className="result-section"><h3>Next steps</h3><ol className="next-step-list">{(result.next_steps || []).map((step, index) => <li key={index}>{step}</li>)}</ol></section><p className="result-disclaimer">This feedback may miss context. Review it and use your judgment before changing your resume.</p></div>}
        </section>
      </div>
      <p className="disclaimer-note"><a href="/privacy">Read the privacy page</a> for details on local storage and how review text is handled.</p>
    </>
  )
}

export default App
