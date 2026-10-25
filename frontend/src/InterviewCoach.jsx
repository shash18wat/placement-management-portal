import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './icons.jsx'

const DSA_PROBLEMS = [
  { id: 'two-sum', level: 'Easy', title: 'Two Sum', prompt: 'Given an array of integers and a target, return the indices of the two values that add up to the target. Assume exactly one answer exists.', hints: ['Try checking previously seen values as you scan.', 'Store each number and its index in a lookup object.'], starter: 'function solution(nums, target) {\n  // Return the two indices.\n  return [];\n}', cases: [{ input: [[2, 7, 11, 15], 9], expected: [0, 1] }, { input: [[3, 2, 4], 6], expected: [1, 2] }, { input: [[3, 3], 6], expected: [0, 1] }] },
  { id: 'valid-parentheses', level: 'Easy', title: 'Valid Parentheses', prompt: 'Return true when each opening bracket is closed by the same type in the correct order. Input contains only (), [], and {}.', hints: ['The most recent opening bracket must close first.', 'Use an array as a stack and a map of closing to opening brackets.'], starter: 'function solution(text) {\n  // Return true or false.\n  return false;\n}', cases: [{ input: ['()'], expected: true }, { input: ['()[]{}'], expected: true }, { input: ['(]'], expected: false }, { input: ['{[]}'], expected: true }] },
  { id: 'binary-search', level: 'Easy', title: 'Binary Search', prompt: 'Given a sorted array and a target, return its index, or -1 if absent. Aim for O(log n) time.', hints: ['Discard half of the remaining search range each step.', 'Keep left and right indexes and choose a midpoint.'], starter: 'function solution(nums, target) {\n  // Return the target index, or -1.\n  return -1;\n}', cases: [{ input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 }, { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 }, { input: [[5], 5], expected: 0 }] },
  { id: 'reverse-string', level: 'Easy', title: 'Reverse a String', prompt: 'Return a new string with the input characters in reverse order.', hints: ['Visit characters from the final index down to zero.'], starter: 'function solution(text) {\n  // Return the reversed string.\n  return "";\n}', cases: [{ input: ['hello'], expected: 'olleh' }, { input: ['Placement'], expected: 'tnemecalP' }, { input: ['a'], expected: 'a' }] },
  { id: 'longest-substring', level: 'Medium', title: 'Longest Unique Substring', prompt: 'Return the length of the longest substring that contains no repeated characters.', hints: ['Keep a moving window with unique characters.', 'When a duplicate appears, move the left edge past its previous position.'], starter: 'function solution(text) {\n  // Return the longest length.\n  return 0;\n}', cases: [{ input: ['abcabcbb'], expected: 3 }, { input: ['bbbbb'], expected: 1 }, { input: ['pwwkew'], expected: 3 }, { input: [''], expected: 0 }] },
  { id: 'product-except-self', level: 'Medium', title: 'Product Except Self', prompt: 'Return an array where each position contains the product of all other values. Do not use division.', hints: ['Build products from the left, then multiply products from the right.', 'A prefix pass and a suffix pass solve this in linear time.'], starter: 'function solution(nums) {\n  // Return the product array.\n  return [];\n}', cases: [{ input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] }, { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] }] },
  { id: 'trapping-rain-water', level: 'Hard', title: 'Trapping Rain Water', prompt: 'Given non-negative bar heights, return how much rain water the bars can trap.', hints: ['Water at each position depends on the tallest bars on both sides.', 'Use two pointers and track the tallest wall seen from each side.'], starter: 'function solution(heights) {\n  // Return the trapped water.\n  return 0;\n}', cases: [{ input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 }, { input: [[4, 2, 0, 3, 2, 5]], expected: 9 }, { input: [[]], expected: 0 }] },
]
const BEHAVIORAL = [
  'Tell me about a time you had to learn a tool or concept quickly. What steps did you take, and what did you deliver?',
  'Describe a team project where you disagreed about an approach. How did you handle the discussion?',
  'Tell me about a mistake or setback in a project. What did you change after that?',
  'How do you decide what to work on first when you have several deadlines?',
  'What kind of feedback has helped you improve, and how did you apply it?',
]

function redacted(value) {
  return String(value || '').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[phone removed]')
    .replace(/(?:https?:\/\/|www\.)\S+/gi, '[link removed]').slice(0, 4000)
}

function scanResume(text, role, skills, description) {
  const lower = text.toLowerCase()
  const words = (text.match(/\b[\w'-]+\b/g) || []).length
  const stopwords = new Set(['and','the','with','for','from','role','intern','entry','level','developer','engineer','support','product','team','building','accessible','interface','components','fixing','issues','documenting','your','work','help','create','repeatable','clearly','small','one','that','this','their','using','used','will','have','has','are','was','were','into','about','each','you','can','should','responsible','assist','assistive','experience','skills','job','good','strong','including','such','which','who','what','when','where','why','how','a','an','to','in','on','of','is','as','by','or','at','be','it','its'])
  const keywords = Array.from(new Set(((String(description || '') + ' ' + String(role || '') + ' ' + String(skills || ''))
    .toLowerCase().match(/[a-z][a-z+#.]{2,}/g) || []).map((word) => word.replace(/\.$/, ''))))
    .filter((word) => !stopwords.has(word)).slice(0, 18)
  const found = keywords.filter((word) => lower.includes(word))
  const checks = [
    { label: 'Contact details', points: 10, passed: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) || /(?:\+?\d[\d\s().-]{7,}\d)/.test(text), tip: 'Add a professional email and a phone number if you want employers to contact you.' },
    { label: 'Education section', points: 10, passed: /\b(education|academic|university|college|degree|bachelor|master)\b/i.test(text), tip: 'Add a clearly labelled Education section with your program, institution, and expected graduation date.' },
    { label: 'Experience or projects', points: 15, passed: /\b(experience|internship|employment|projects|project)\b/i.test(text), tip: 'Add a clearly labelled Experience or Projects section with your own contribution.' },
    { label: 'Skills section', points: 10, passed: /\b(technical\s+)?skills\b/i.test(text), tip: 'Add a clearly labelled Skills section using tools you can explain and demonstrate.' },
    { label: 'Profile or objective', points: 5, passed: /\b(summary|objective|profile)\b/i.test(text), tip: 'Add a short profile tailored to the role you want.' },
    { label: 'Evidence of outcomes', points: 10, passed: /\b(improved|built|created|tested|designed|reduced|delivered|analyzed|analysed|implemented|measured|launched)\b/i.test(text) && /\b\d+%?\b/.test(text), tip: 'Where accurate, describe what you did and the result. Use numbers only when you can verify them.' },
  ]
  const sections = checks.reduce((sum, item) => sum + (item.passed ? item.points : 0), 0)
  const keywordPoints = keywords.length ? Math.round(25 * found.length / keywords.length) : 12
  const lengthPoints = words >= 250 && words <= 850 ? 15 : words >= 140 && words <= 1000 ? 10 : words > 70 ? 5 : 0
  let suggestions = checks.filter((item) => !item.passed).map((item) => item.tip)
  if (keywords.length && found.length < keywords.length) suggestions.unshift('If accurate for your experience, add relevant missing role terms: ' + keywords.filter((word) => !found.includes(word)).slice(0, 7).join(', ') + '.')
  if (words < 140) suggestions.push('The extracted text is short. Check that the PDF contains selectable text; scanned images need OCR before they can be reviewed.')
  if (words > 1000) suggestions.push('Consider making the resume more concise and keeping the most relevant details near the top.')
  if (!suggestions.length) suggestions = ['The basic structure looks complete. Check each claim and tailor the first half of the resume to the selected role.']
  return { score: Math.min(100, sections + keywordPoints + lengthPoints), words, checks, keywords, found, suggestions }
}

const MAX_INTERVIEW_QUESTIONS = 5
const INTERVIEW_LEVELS = {
  warmup: { label: 'Warm-up', description: 'Supportive prompts that help you settle in.' },
  real: { label: 'Real round', description: 'Focused follow-ups like a typical interview.' },
  barraiser: { label: 'Bar-raiser', description: 'Rigorous questions about evidence, trade-offs, and edge cases.' },
}

function fallbackQuestion(round, resume, index, role, level, previousAnswer = '') {
  const questions = round === 'behavioral'
    ? {
        warmup: [
          'Take your time. Tell me about a time you had to learn a tool or concept quickly. What did you try first?',
          'Thanks for sharing. What part of the work did you personally take ownership of?',
          'What was one tricky moment, and what helped you move forward?',
          'How did you know your work helped? A small example is fine.',
          'Looking back, what is one thing you might try differently next time?',
        ],
        real: [
          'Tell me about a time you had to learn a tool or concept quickly. What steps did you take, and what did you deliver?',
          'What was your personal responsibility, and how did you decide what to do first?',
          'Walk me through the actions you took, in order. What alternatives did you consider?',
          'What changed because of your work, and what evidence tells you that?',
          'With what you know now, what would you change if you faced that situation again?',
        ],
        barraiser: [
          'Describe a time you had to learn an unfamiliar tool quickly. What evidence shows you reached a useful level of proficiency?',
          'Which decisions and deliverables were specifically yours, and how can we distinguish them from the team’s work?',
          'What alternatives did you reject, and what trade-offs or risks did your choice introduce?',
          'What measurable result changed because of your work, and how did you verify that your actions caused it?',
          'What assumption in your approach proved weakest, and what would you change using the evidence you have now?',
        ],
      }[level]
    : null
  if (questions) return questions[index]
  const raw = String(resume)
  const projectMatch = raw.match(/\b(?:projects?|work experience|experience|internship)\b[\s:|–-]*([^\n.]{24,180}\.?)/i)
  const line = projectMatch?.[1]?.trim() || raw.split(/\n+/).map((item) => item.replace(/^[\s•*▪-]+/, '').trim()).find((item) => item.length > 28 && !/@|https?:|linkedin/i.test(item))
  const claim = line ? 'Your resume mentions “' + line.slice(0, 160).replace(/[.!?]+$/, '') + '”. ' : 'For a ' + (role || 'this') + ' role, '
  const sequences = {
    warmup: [
      'Take your time. ' + claim + 'what problem were you trying to solve?',
      'Which part did you work on yourself? What did you enjoy contributing?',
      'What was one tricky part, and what did you try first?',
      'How did you check that your solution worked?',
      'Looking back, what is one thing you might improve? ' + (previousAnswer ? 'You can build on your previous answer.' : ''),
    ],
    real: [
      claim + 'walk me through the project and the problem it was meant to solve.',
      'Which part did you personally own, and what decision did you make that shaped the outcome?',
      'What was the hardest technical or teamwork challenge? How did you work through it?',
      'How did you test or measure whether your solution worked? What evidence can you share?',
      'What trade-off or limitation would you revisit, and what would you do differently now? ' + (previousAnswer ? 'Please connect it to the example you just described.' : ''),
    ],
    barraiser: [
      'Be specific: ' + claim + 'which user need or technical constraint shaped the project, and how did you validate that need?',
      'Which precise deliverable was yours, and what evidence separates your contribution from the team’s?',
      'What constraint most threatened the result? Which alternatives did you reject, and why?',
      'What objective test or measure demonstrates the solution worked? What edge case could still fail?',
      'Which trade-off created the largest limitation, and what evidence would make you redesign it?',
    ],
  }
  return sequences[level][index]
}
function answerAnalysis(answer) {
  const words = String(answer).trim().split(/\s+/).filter(Boolean).length
  const checks = [
    { label: 'Enough context', done: words >= 25 },
    { label: 'Personal ownership', done: /\b(i|my|we|our)\b/i.test(answer) },
    { label: 'Clear action', done: /\b(built|made|designed|tested|led|created|implemented|debugged|analyzed|analysed|decided|organized|organised|wrote|improved|measured|reduced|delivered|worked|planned|changed)\w*/i.test(answer) },
    { label: 'Evidence or reflection', done: /\b(result|learn|improv|deliver|test|measure|outcome|because|increased|decreased|reduced|users|customer|feedback|metric|percent|seconds|minutes)\w*|\b\d+(?:\.\d+)?%?\b/i.test(answer) },
  ]
  let improvement = 'Add one concrete result or lesson, and say how you verified it.'
  let feedback = 'Your answer gives you a solid base to practise from.'
  const strength = checks[1].done ? 'You made your own contribution visible.' : 'You responded to the question.'
  if (!checks[0].done) { improvement = 'Add a short situation and enough detail for the interviewer to understand the example.'; feedback = 'This is a useful start; add a little context so the example is easier to follow.' }
  else if (!checks[1].done) { improvement = 'Use “I” to separate your own decisions and work from the team’s contribution.'; feedback = 'You gave context, but your personal contribution is not yet clear.' }
  else if (!checks[2].done) { improvement = 'Name the specific steps or decisions you took.'; feedback = 'Your role is visible; make the actions you took more specific.' }
  return { feedback, strength, improvement, checks, wordCount: words, structureScore: checks.filter((item) => item.done).length }
}
function InterviewAvatar({ speaking }) {
  return <img className={'coach-avatar' + (speaking ? ' coach-avatar--speaking' : '')} src="/interviewer.jpg" alt="AI interviewer portrait" />
}

function ResumeScanResult({ result }) {
  return <section className="coach-panel ats-result" aria-live="polite">
    <div className="ats-score"><span className="ats-score-number">{result.score}</span><span className="ats-score-denom">/100</span><div><strong>ATS-style readiness estimate</strong><small>{result.words} words extracted · checklist heuristic</small></div></div>
    <p className="coach-disclaimer">This is not a universal ATS score or hiring decision. Employers use different systems and criteria.</p>
    <div className="ats-check-grid">{result.checks.map((item) => <div className={'ats-check' + (item.passed ? ' ats-check--pass' : '')} key={item.label}><span>{item.passed ? '✓' : '○'}</span>{item.label}<strong>{item.passed ? item.points : 0}/{item.points}</strong></div>)}</div>
    {result.keywords.length > 0 && <div className="ats-keywords"><strong>Role terms</strong><div>{result.keywords.map((word) => <span className={'keyword-pill' + (result.found.includes(word) ? ' keyword-pill--found' : '')} key={word}>{word}</span>)}</div><small>Only add missing terms if they truthfully describe your experience.</small></div>}
    <div className="ats-suggestions"><h3>Ways to improve</h3><ul>{result.suggestions.map((tip, index) => <li key={index}>{tip}</li>)}</ul></div>
  </section>
}

export default function InterviewCoach({ profile, opportunities = [], geminiEnabled = false }) {
  const [activeTab, setActiveTab] = useState('resume')
  const [resumeText, setResumeText] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [readingResume, setReadingResume] = useState(false)
  const [targetRole, setTargetRole] = useState(profile.targetRole || opportunities[0]?.role || '')
  const [targetDescription, setTargetDescription] = useState(opportunities[0]?.description || '')
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(opportunities[0]?.id || '')
  const [aiConsent, setAiConsent] = useState(false)
  const [roundName, setRoundName] = useState('resume')
  const [interviewerLevel, setInterviewerLevel] = useState('real')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [hintIndex, setHintIndex] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [lastFeedback, setLastFeedback] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [busy, setBusy] = useState(false)
  const [interviewError, setInterviewError] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [voices, setVoices] = useState([])
  const [voiceId, setVoiceId] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [problemId, setProblemId] = useState(DSA_PROBLEMS[0].id)
  const [code, setCode] = useState(DSA_PROBLEMS[0].starter)
  const [testResults, setTestResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [testError, setTestError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const selectedProblem = DSA_PROBLEMS.find((item) => item.id === problemId) || DSA_PROBLEMS[0]
  const selectedOpportunity = opportunities.find((item) => item.id === selectedOpportunityId)
  const scanSkills = (profile.skills || '') + ', ' + (selectedOpportunity?.skills || []).join(', ')
  const scan = useMemo(() => resumeText ? scanResume(resumeText, targetRole, scanSkills, targetDescription) : null, [resumeText, targetRole, scanSkills, targetDescription])

  useEffect(() => {
    if (opportunities.length && !selectedOpportunityId) {
      setSelectedOpportunityId(opportunities[0].id)
      setTargetDescription(opportunities[0].description || '')
    }
  }, [opportunities, selectedOpportunityId])
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return undefined
    const update = () => {
      const available = synth.getVoices()
      setVoices(available)
      if (!voiceId && available.length) {
        const preferred = available.find((voice) => /en/i.test(voice.lang) && /female|woman|zira|samantha|aria|jenny|susan/i.test(voice.name)) || available.find((voice) => /en/i.test(voice.lang)) || available[0]
        if (preferred) setVoiceId(preferred.voiceURI)
      }
    }
    update()
    synth.addEventListener?.('voiceschanged', update)
    return () => synth.removeEventListener?.('voiceschanged', update)
  }, [voiceId])
  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    recognitionRef.current?.stop?.()
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])
  useEffect(() => { if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current }, [cameraOn])
  useEffect(() => { if (question && autoSpeak) speak(question) }, [question])

  async function readResume(file) {
    setResumeError('')
    setResumeText('')
    setResumeName('')
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setResumeError('Please choose a file under 10 MB.'); return }
    setReadingResume(true)
    try {
      const name = file.name.toLowerCase()
      let text = ''
      if (name.endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist')
        const pdfWorkerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
        const pages = []
        for (let n = 1; n <= Math.min(pdf.numPages, 20); n += 1) {
          const page = await pdf.getPage(n)
          const content = await page.getTextContent()
          pages.push(content.items.map((item) => ('str' in item ? item.str : '') + (item.hasEOL ? '\n' : ' ')).join(''))
        }
        text = pages.join('\n')
      } else if (name.endsWith('.docx')) {
        const mammoth = (await import('mammoth')).default
        text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value
      } else if (name.endsWith('.txt')) text = await file.text()
      else throw new Error('Choose a PDF, DOCX, or TXT resume.')
      text = text.replace(/\u0000/g, '').trim().slice(0, 20000)
      if (text.length < 40) throw new Error('No readable text was found. Scanned image PDFs need OCR; try a selectable-text PDF or DOCX.')
      setResumeText(text)
      setResumeName(file.name)
      setTranscript([])
      setQuestion('')
      setLastFeedback(null)
      setInterviewStarted(false)
    } catch (error) {
      setResumeError(error.message || 'Could not read this file. Try another PDF or DOCX.')
    } finally { setReadingResume(false) }
  }

  function speak(value = question) {
    if (!value || !window.speechSynthesis) { setVoiceStatus('Speech playback is unavailable in this browser.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    const voice = voices.find((item) => item.voiceURI === voiceId)
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang }
    utterance.onstart = () => setVoiceStatus('Interviewer is speaking…')
    utterance.onend = () => setVoiceStatus('')
    utterance.onerror = () => setVoiceStatus('Could not play this voice; you can still read the question.')
    window.speechSynthesis.speak(utterance)
  }

  function startVoiceAnswer() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setVoiceStatus('Voice typing is unavailable in this browser. Type your answer; the interviewer can still speak.'); return }
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.continuous = false
      recognition.onstart = () => setVoiceStatus('Listening for your answer…')
      recognition.onresult = (event) => {
        const spoken = Array.from(event.results).map((item) => item[0]?.transcript || '').join(' ')
        setAnswer((current) => (current ? current.trimEnd() + ' ' : '') + spoken)
      }
      recognition.onerror = (event) => setVoiceStatus(event.error === 'not-allowed' ? 'Microphone permission was denied. Type your answer instead.' : 'Voice typing stopped. Type your answer instead.')
      recognition.onend = () => { recognitionRef.current = null; setVoiceStatus('') }
      recognitionRef.current = recognition
      recognition.start()
    } catch { setVoiceStatus('Could not start voice typing. You can type your answer instead.') }
  }

  async function toggleCamera() {
    setCameraError('')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      setCameraOn(true)
    } catch { setCameraError('Camera access was not granted. You can practise without video.') }
  }

  async function askNext(index = questionIndex, firstRound = false, requestedRound = roundName) {
    if (!resumeText) { setInterviewError('Scan your resume first; the file is read on this device.'); setActiveTab('resume'); return }
    setBusy(true)
    setInterviewError('')
    setAnswer('')
    setLastFeedback(null)
    let next = ''
    if (geminiEnabled && aiConsent) {
      try {
        const previous = transcript[transcript.length - 1]
        const response = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          action: 'question', round_name: requestedRound, target_role: targetRole, resume_excerpt: redacted(resumeText),
          previous_question: firstRound ? '' : previous?.question || '', answer: firstRound ? '' : redacted(previous?.answer || ''), interviewer_level: interviewerLevel, question_index: index, consent_to_ai: true,
        }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.detail || 'AI interviewer unavailable.')
        next = result.question
      } catch (error) { setInterviewError((error.message || 'AI service unavailable.') + ' A built-in practice question will be used.') }
    }
    if (!next) next = fallbackQuestion(requestedRound, resumeText, index, targetRole, interviewerLevel, transcript[transcript.length - 1]?.answer || '')
    setQuestion(next)
    setQuestionIndex(index + 1)
    setInterviewStarted(true)
    setBusy(false)
  }

  function startInterview(requestedRound) {
    setRoundName(requestedRound)
    setTranscript([])
    setQuestionIndex(0)
    setQuestion('')
    setLastFeedback(null)
    setInterviewStarted(true)
    askNext(0, true, requestedRound)
  }

  async function sendAnswer() {
    if (!question || !answer.trim()) { setInterviewError('Type or record an answer before sending it.'); return }
    setBusy(true)
    setInterviewError('')
    const analysis = answerAnalysis(answer)
    let feedback = analysis
    if (geminiEnabled && aiConsent) {
      try {
        const response = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          action: 'evaluate', round_name: roundName, target_role: targetRole, resume_excerpt: redacted(resumeText),
          previous_question: question, answer: redacted(answer), consent_to_ai: true,
        }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.detail || 'AI feedback unavailable.')
        feedback = { ...analysis, ...result }
      } catch (error) { setInterviewError((error.message || 'AI feedback unavailable.') + ' Built-in coaching notes are shown below.') }
    }
    setTranscript((items) => [...items, { question, answer: answer.trim(), feedback, analysis }])
    setLastFeedback(feedback)
    setQuestion('')
    setBusy(false)
  }

  async function runTests() {
    setRunning(true)
    setTestError('')
    setTestResults(null)
    let worker
    let timeout
    try {
      worker = new Worker(new URL('./interview-runner.worker.js', import.meta.url), { type: 'module' })
      const token = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)
      const results = await new Promise((resolve, reject) => {
        timeout = window.setTimeout(() => reject(new Error('The code exceeded the 2 second run limit. Check for an infinite loop and try again.')), 2000)
        worker.onmessage = (event) => {
          if (event.data?.token !== token) return
          if (event.data.error) reject(new Error(event.data.error))
          else resolve(event.data.results)
        }
        worker.onerror = () => reject(new Error('Code runner stopped. Check your JavaScript syntax and try again.'))
        worker.postMessage({ token, code, cases: selectedProblem.cases })
      })
      setTestResults(results)
    } catch (error) { setTestError(error.message || 'Could not run these tests.') }
    finally { window.clearTimeout(timeout); worker?.terminate(); setRunning(false) }
  }

  const passed = testResults?.filter((item) => item.passed).length || 0

  return <div className="interview-coach">
    <div className="page-heading"><div><p className="eyebrow">PRACTICE STUDIO</p><h1>Resume & interview coach</h1><p className="page-description">Scan a resume, practise with a spoken interviewer, and solve coding questions with test cases.</p></div><span className="status-chip status-chip--complete">Practice only</span></div>
    <div className="interview-roadmap" aria-label="Interview practice roadmap">
      <button className="roadmap-card" onClick={() => setActiveTab('resume')}><span className="roadmap-step">START</span><strong>Resume review</strong><small>Upload, scan, and choose a role</small></button>
      <button className="roadmap-card" onClick={() => { setRoundName('resume'); setActiveTab('interview') }}><span className="roadmap-step">ROUND 1</span><strong>Resume deep dive</strong><small>Voice questions about your experience</small></button>
      <button className="roadmap-card" onClick={() => setActiveTab('coding')}><span className="roadmap-step">ROUND 2</span><strong>Live DSA practice</strong><small>Code, run examples, and reveal hints</small></button>
      <button className="roadmap-card" onClick={() => { setRoundName('behavioral'); setActiveTab('interview') }}><span className="roadmap-step">ROUND 3</span><strong>Behavioral interview</strong><small>Practise decisions and reflection</small></button>
    </div>
    <div className="coach-tabs" role="tablist" aria-label="Practice sections">
      <button role="tab" aria-selected={activeTab === 'resume'} className={'coach-tab' + (activeTab === 'resume' ? ' coach-tab--active' : '')} onClick={() => setActiveTab('resume')}><Icon name="document" size={17} />Resume scan</button>
      <button role="tab" aria-selected={activeTab === 'interview'} className={'coach-tab' + (activeTab === 'interview' ? ' coach-tab--active' : '')} onClick={() => setActiveTab('interview')}><Icon name="feedback" size={17} />Voice interview</button>
      <button role="tab" aria-selected={activeTab === 'coding'} className={'coach-tab' + (activeTab === 'coding' ? ' coach-tab--active' : '')} onClick={() => setActiveTab('coding')}><Icon name="roles" size={17} />DSA coding round</button>
    </div>
    {activeTab === 'resume' && <div className="coach-layout">
      <section className="coach-panel"><p className="eyebrow">STEP 1 · ADD YOUR RESUME</p><h2>Scan a resume on this device</h2><p className="coach-copy">PDF, DOCX, or TXT. Text is extracted in your browser; this scan does not upload or save the file.</p>
        <label className="coach-file-picker"><Icon name="document" size={20} /><span><strong>{readingResume ? 'Reading file…' : resumeName || 'Choose a resume file'}</strong><small>PDF, DOCX, or TXT · up to 10 MB</small></span><input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(event) => readResume(event.target.files?.[0])} disabled={readingResume} /></label>
        {resumeError && <p className="coach-error" role="alert">{resumeError}</p>}
        {resumeText && <><label className="coach-field-label" htmlFor="resume-text">Extracted text <small>Correct extraction errors here; the text stays in this tab.</small></label><textarea id="resume-text" className="coach-textarea coach-textarea--resume" value={resumeText} onChange={(event) => setResumeText(event.target.value.slice(0, 20000))} />
          <div className="coach-control-row"><label>Target role<input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Frontend Developer Intern" /></label><label>Compare with a sample role<select value={selectedOpportunityId} onChange={(event) => { const item = opportunities.find((role) => role.id === event.target.value); setSelectedOpportunityId(event.target.value); if (item) { setTargetRole(item.role); setTargetDescription(item.description || '') } }}><option value="">No sample role</option>{opportunities.map((item) => <option value={item.id} key={item.id}>{item.role}</option>)}</select></label></div>
          <label className="coach-field-label" htmlFor="target-description">Job requirements <small>Optional; used only for the local keyword comparison.</small></label><textarea id="target-description" className="coach-textarea coach-textarea--small" value={targetDescription} onChange={(event) => setTargetDescription(event.target.value)} placeholder="Paste job requirements for a more useful keyword check." /></>}
        <div className="coach-privacy-note"><Icon name="shield" size={16} /><span>File reading and ATS-style checks stay in your browser. Gemini consent is optional for interview practice.</span></div>
      </section>
      <div className="coach-results-column">{scan ? <ResumeScanResult result={scan} /> : <section className="coach-panel coach-empty"><span className="empty-icon"><Icon name="document" size={21} /></span><h2>Your scan will appear here</h2><p>Upload a resume to see an estimate, missing role terms, and specific improvements.</p></section>}
        {scan && <button className="button button--primary coach-wide-button" onClick={() => setActiveTab('interview')}>Practise an interview from this resume <Icon name="arrow" size={16} /></button>}
      </div>
    </div>}
    {activeTab === 'interview' && <section className="coach-panel interview-stage"><p className="eyebrow">STEP 2 · VOICE PRACTICE</p><h2>Practise with your interviewer</h2>
      {!resumeText && <div className="coach-inline-notice">Scan your resume first to tailor the first round. <button className="text-button" onClick={() => setActiveTab('resume')}>Go to resume scan</button></div>}
      <div className="interview-options"><label>Interview round<select value={roundName} onChange={(event) => { setRoundName(event.target.value); setInterviewStarted(false); setQuestion(''); setLastFeedback(null) }}><option value="resume">Round 1 · Resume-based</option><option value="behavioral">Round 3 · Behavioral</option></select></label><label>Interview style<select value={interviewerLevel} onChange={(event) => setInterviewerLevel(event.target.value)}>{Object.entries(INTERVIEW_LEVELS).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}</select><small>{INTERVIEW_LEVELS[interviewerLevel].description}</small></label><label>Interviewer voice<select value={voiceId} onChange={(event) => setVoiceId(event.target.value)}><option value="">Browser default voice</option>{voices.map((voice) => <option value={voice.voiceURI} key={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></label>
        {geminiEnabled ? <label className="coach-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>Use Gemini AI. I agree that the role, contact-redacted resume text, and my answers may pass through this portal server to Google Gemini for practice questions and coaching. Remove your name or address before opting in. The file and camera are not sent.</span></label> : <div className="coach-local-ai"><Icon name="shield" size={17} /><span>Built-in practice questions are active. Gemini is not configured, so no resume or answer is sent to an AI provider.</span></div>}
      </div>
      <label className="auto-speak-setting"><input type="checkbox" checked={autoSpeak} onChange={(event) => setAutoSpeak(event.target.checked)} /> Read each new question aloud automatically</label>
      <div className="interview-grid">
        <article className="interview-person-card"><div className="interview-card-top"><span>AI INTERVIEWER</span><span className="interview-live-dot" /></div><InterviewAvatar speaking={voiceStatus.includes('speaking')} /><strong>Practice interviewer</strong><small>Voice interview practice</small>{question && <button className="button button--secondary" onClick={() => speak()}><Icon name="feedback" size={16} />Play question aloud</button>}<small className="voice-credit">Browser voice · no downloaded recording</small></article>
        <article className="interview-person-card interview-person-card--candidate"><div className="interview-card-top"><span>YOUR CAMERA PREVIEW</span><span className="interview-camera-state">{cameraOn ? 'ON' : 'OFF'}</span></div>{cameraOn ? <video className="candidate-video" ref={videoRef} autoPlay playsInline muted aria-label="Local camera preview" /> : <div className="camera-placeholder"><Icon name="profile" size={31} /><span>Camera is off</span><small>Optional local preview</small></div>}<button className="button button--secondary" onClick={toggleCamera}>{cameraOn ? 'Turn camera off' : 'Turn camera on'}</button>{cameraError && <small className="coach-error">{cameraError}</small>}<small className="voice-credit">Not recorded or uploaded.</small></article>
      </div>
      <div className="interview-question-card">
        {!interviewStarted && <div><strong>Ready when you are</strong><p>Your interviewer speaks through a browser voice. Type your answer or try voice typing if your browser supports it.</p><button className="button button--primary" onClick={() => startInterview(roundName)} disabled={!resumeText || busy}>Start {roundName === 'resume' ? 'resume' : 'behavioral'} round</button></div>}
        {busy && <p className="coach-loading" role="status">Preparing practice notes…</p>}
        {question && <><p className="eyebrow">{roundName === 'resume' ? 'RESUME INTERVIEW' : 'BEHAVIORAL INTERVIEW'} · QUESTION {questionIndex} OF {MAX_INTERVIEW_QUESTIONS} · {INTERVIEW_LEVELS[interviewerLevel].label.toUpperCase()}</p><h3>{question}</h3><label className="coach-field-label" htmlFor="interview-answer">Your answer</label><textarea id="interview-answer" className="coach-textarea" rows="5" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Explain the context, what you did, and what happened." /><div className="interview-action-row"><button className="button button--secondary" onClick={startVoiceAnswer}><Icon name="feedback" size={16} />Answer by voice</button><button className="button button--primary" onClick={sendAnswer} disabled={!answer.trim() || busy}>Send answer for feedback</button></div>{voiceStatus && <p className="coach-voice-status" role="status">{voiceStatus}</p>}<small className="voice-credit">Voice typing can use your browser’s speech provider. The portal does not record audio.</small></>}
        {lastFeedback && <div className="practice-feedback"><p className="eyebrow">ANSWER STRUCTURE · {lastFeedback.structureScore}/4</p><p>{lastFeedback.feedback}</p><div className="answer-checklist">{lastFeedback.checks?.map((item) => <span className={item.done ? 'answer-check answer-check--done' : 'answer-check'} key={item.label}>{item.done ? '✓' : '○'} {item.label}</span>)}</div><div><span><strong>Keep:</strong> {lastFeedback.strength}</span><span><strong>Next improvement:</strong> {lastFeedback.improvement}</span><span><strong>Length:</strong> {lastFeedback.wordCount} words</span></div>{transcript.length < MAX_INTERVIEW_QUESTIONS ? <button className="button button--primary" onClick={() => askNext(questionIndex)} disabled={busy}>Ask next question</button> : <strong className="round-complete">Round complete · review your answers below.</strong>}</div>}
        {interviewError && <p className="coach-error" role="alert">{interviewError}</p>}
      </div>
      {transcript.length > 0 && <section className="practice-recap"><div className="panel-heading"><div><p className="eyebrow">YOUR SESSION</p><h3>Practice recap</h3></div><span className="status-chip">{transcript.length} answers</span></div>{transcript.map((item, index) => <article className="recap-item" key={index}><strong>Q{index + 1}. {item.question}</strong><p>{item.answer}</p><small>{item.feedback?.improvement}</small></article>)}<p className="coach-disclaimer">These notes help you practise explaining your experience. They do not decide whether you are a good or bad candidate.</p></section>}
    </section>}
    {activeTab === 'coding' && <div className="coding-layout"><section className="coach-panel coding-prompt"><p className="eyebrow">ROUND 2 · DSA PRACTICE</p><h2>Write and test your solution</h2><label className="interview-select-label">Choose a question<select value={problemId} onChange={(event) => { const chosen = DSA_PROBLEMS.find((item) => item.id === event.target.value); setProblemId(event.target.value); setCode(chosen?.starter || ''); setHintIndex(0); setTestResults(null); setTestError('') }}>{DSA_PROBLEMS.map((item) => <option key={item.id} value={item.id}>[{item.level}] {item.title}</option>)}</select></label><div className="problem-meta"><strong>{selectedProblem.title}</strong><span>{selectedProblem.level}</span><small>JavaScript ES5</small></div><p className="problem-prompt">{selectedProblem.prompt}</p><div className="hint-box"><button className="button button--secondary" onClick={() => setHintIndex((current) => Math.min(current + 1, selectedProblem.hints.length))} disabled={hintIndex >= selectedProblem.hints.length}>{hintIndex === 0 ? 'Show a hint' : hintIndex >= selectedProblem.hints.length ? 'All hints shown' : 'Show next hint'} <span>{hintIndex}/{selectedProblem.hints.length}</span></button>{hintIndex > 0 && <ul>{selectedProblem.hints.slice(0, hintIndex).map((hint, index) => <li key={index}>{hint}</li>)}</ul>}</div><div className="testcase-preview"><strong>Visible examples</strong>{selectedProblem.cases.map((item, index) => <code key={index}>Test {index + 1}: solution(...{JSON.stringify(item.input)}) → {JSON.stringify(item.expected)}</code>)}</div><p className="coach-disclaimer">Practice only. Test cases run in a restricted JavaScript interpreter in this browser. Use ES5 syntax (function/var; no let, const, or arrow functions).</p><button className="button button--primary" onClick={runTests} disabled={running}>{running ? 'Running tests…' : 'Run test cases'}<Icon name="arrow" size={15} /></button>{testError && <p className="coach-error" role="alert">{testError}</p>}{testResults && <div className="test-results" aria-live="polite"><strong>{passed} of {testResults.length} test cases passed</strong>{testResults.map((item, index) => <div className={item.passed ? 'test-result test-result--pass' : 'test-result test-result--fail'} key={index}><span>{item.passed ? '✓' : '×'} Test {index + 1}</span>{!item.passed && <small>Expected {item.expected}; received {item.actual}</small>}</div>)}</div>}</section>
      <section className="coach-panel code-editor-panel"><div className="code-editor-heading"><label htmlFor="dsa-code">Your JavaScript solution</label><span>Runs locally · 2 second limit</span></div><textarea id="dsa-code" className="code-editor" spellCheck="false" autoCapitalize="off" autoCorrect="off" value={code} onChange={(event) => { setCode(event.target.value.slice(0, 12000)); setTestResults(null) }} /><small>Implement <code>solution(...input)</code>. Run the visible tests to check your work.</small></section></div>}
    <p className="coach-footer-note"><Icon name="shield" size={16} />Educational practice only; this simulator does not make recruitment or hiring decisions.</p>
  </div>
}