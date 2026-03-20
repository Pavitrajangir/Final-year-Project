import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const SPECIALITY_MAP = {
  'general physician': 'General physician',
  'general practice':  'General physician',
  'internal medicine': 'General physician',
  'gynecologist':      'Gynecologist',
  'gynecology':        'Gynecologist',
  'obgyn':             'Gynecologist',
  'dermatologist':     'Dermatologist',
  'dermatology':       'Dermatologist',
  'skin':              'Dermatologist',
  'pediatrician':      'Pediatricians',
  'pediatrics':        'Pediatricians',
  'paediatrics':       'Pediatricians',
  'neurologist':       'Neurologist',
  'neurology':         'Neurologist',
  'gastroenterologist':'Gastroenterologist',
  'gastroenterology':  'Gastroenterologist',
}

const parseSpeciality = (text) => {
  const lower = text.toLowerCase()
  for (const [key, value] of Object.entries(SPECIALITY_MAP)) {
    if (lower.includes(key)) return value
  }
  return null
}

const SYMPTOM_PROMPT = (symptom) =>
  `A patient describes their problem as: "${symptom}"

Please respond in this exact format:
1. CONDITION: Brief explanation of what this might be (2-3 sentences, non-alarming, factual)
2. SPECIALITY: Which type of doctor they should see (single speciality name only)
3. URGENCY: One of — Routine / Soon / Urgent
4. ADVICE: One practical tip they can follow right now (1 sentence)

Keep the tone calm, clear and professional. Do not diagnose — only suggest.`

const SYSTEM_PROMPT = 'You are a helpful medical guidance assistant for Indian patients. Help patients understand which doctor to see based on their symptoms. Never diagnose. Always recommend seeing a doctor. Keep responses structured and calm.'

const SpinIcon = () => (
  <svg className='animate-spin' width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
    <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
  </svg>
)

const InfoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='2'>
    <circle cx='12' cy='12' r='10'/><path d='M12 8v4M12 16h.01' strokeLinecap='round'/>
  </svg>
)

// Formats the numbered AI response into styled paragraphs
const ReplyLines = ({ text, compact }) =>
  text.split('\n').filter(Boolean).map((line, i) => {
    const isHeader = /^\d+\./.test(line)
    return (
      <p key={i} className={isHeader
        ? `font-semibold text-slate-800 mt-3 first:mt-0 ${compact ? 'text-sm' : ''}`
        : `text-slate-600 leading-relaxed ml-4 ${compact ? 'text-xs mt-0.5' : 'text-sm'}`}>
        {line}
      </p>
    )
  })

// Shared error box
const ErrorBox = ({ error }) => (
  <div className='mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700'>
    <p>{error}</p>
    {error.includes('GROQ') && (
      <p className='mt-1 text-xs'>
        Get a free key at <strong>console.groq.com</strong> and set{' '}
        <code className='bg-red-100 px-1 rounded'>GROQ_API_KEY</code> in <code className='bg-red-100 px-1 rounded'>backend/.env</code>
      </p>
    )}
  </div>
)

// Shared doctor recommendation CTA
const DoctorCTA = ({ speciality, onNavigate, label = 'View Doctors' }) => (
  <div className='bg-[var(--primary-light)] border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4'>
    <div>
      <p className='text-xs font-semibold text-[var(--primary)]'>Recommended</p>
      <p className='text-sm font-semibold text-slate-900'>{speciality}</p>
    </div>
    <button onClick={onNavigate}
      className='bg-[var(--primary)] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors whitespace-nowrap flex-shrink-0'>
      {label}
    </button>
  </div>
)

// Shared hook for symptom analysis logic
const useSymptomAnalyser = (backendUrl) => {
  const [symptom, setSymptom] = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const analyse = async () => {
    if (!symptom.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const resp = await fetch(`${backendUrl}/api/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:     [{ role: 'user', content: SYMPTOM_PROMPT(symptom) }],
          systemPrompt: SYSTEM_PROMPT,
        }),
      })
      const data = await resp.json()
      if (data.success) {
        setResult({ reply: data.reply, speciality: parseSpeciality(data.reply) })
      } else {
        setError(data.message || 'Could not analyse symptoms. Please try again.')
      }
    } catch {
      setError('Could not reach the server. Please make sure the backend is running on port 4000.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setError(''); setSymptom('') }

  return { symptom, setSymptom, loading, result, error, analyse, reset }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline section — shown on Home page
// ─────────────────────────────────────────────────────────────────────────────
export const SymptomCheckerSection = () => {
  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()
  const { symptom, setSymptom, loading, result, error, analyse, reset } = useSymptomAnalyser(backendUrl)

  const EXAMPLES = [
    'Headache for 3 days with blurred vision',
    'My child has had fever since yesterday',
    'Stomach pain after eating, bloating',
  ]

  return (
    <section className='py-14 border-t border-slate-200'>
      <div className='flex flex-col md:flex-row gap-10 items-start'>

        {/* Left — intro */}
        <div className='md:w-72 flex-shrink-0'>
          <div className='w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center mb-4'>
            <InfoIcon />
          </div>
          <h2 className='font-sora font-bold text-2xl text-slate-900 mb-3'>Not sure what's wrong?</h2>
          <p className='text-slate-500 text-sm leading-relaxed mb-4'>
            Describe your symptoms in plain language. Our AI will suggest which doctor to consult.
          </p>
          <div className='flex flex-col gap-2'>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setSymptom(ex)}
                className='text-left text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors bg-white'>
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* Right — checker */}
        <div className='flex-1 bg-white border border-slate-200 rounded-xl p-6'>
          <label className='text-xs font-semibold text-slate-600 block mb-2'>
            Describe your symptoms or health concern
          </label>
          <textarea
            value={symptom}
            onChange={e => setSymptom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); analyse() } }}
            placeholder='e.g. I have been having a persistent headache for 3 days, along with neck stiffness...'
            rows={4}
            className='w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] resize-none text-slate-800 placeholder-slate-400'
          />
          <div className='flex items-center gap-3 mt-3'>
            <button onClick={analyse} disabled={!symptom.trim() || loading}
              className='bg-[var(--primary)] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 flex items-center gap-2'>
              {loading ? <><SpinIcon /> Analysing...</> : 'Analyse Symptoms'}
            </button>
            {(result || error) && (
              <button onClick={reset} className='text-sm text-slate-400 hover:text-slate-600 transition-colors'>
                Clear
              </button>
            )}
          </div>

          {error && <ErrorBox error={error} />}

          {result && (
            <div className='mt-5 border-t border-slate-100 pt-5'>
              <div className='flex flex-col gap-1 mb-4'>
                <ReplyLines text={result.reply} />
              </div>
              {result.speciality && (
                <div className='mt-4'>
                  <DoctorCTA
                    speciality={result.speciality}
                    onNavigate={() => { navigate(`/doctors/${result.speciality}`); window.scrollTo(0, 0) }}
                  />
                </div>
              )}
              <p className='text-xs text-slate-400 mt-3'>
                This is not a medical diagnosis. Always consult a qualified doctor for proper evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating panel — shown on Doctors page sidebar
// ─────────────────────────────────────────────────────────────────────────────
export const SymptomCheckerFloat = () => {
  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { symptom, setSymptom, loading, result, error, analyse, reset } = useSymptomAnalyser(backendUrl)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus()
  }, [open])

  const close = () => { setOpen(false); reset() }

  const EXAMPLES = ['Fever and body ache', 'Stomach pain after meals', 'Skin rash on arms', 'Headache and dizziness']

  return (
    <>
      <button onClick={() => setOpen(true)}
        className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-[var(--primary)] hover:shadow-sm transition-all group w-full text-left'>
        <div className='w-8 h-8 bg-[var(--primary-light)] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] transition-colors'>
          <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='2'
            className='group-hover:stroke-white transition-colors'>
            <circle cx='12' cy='12' r='10'/><path d='M12 8v4M12 16h.01' strokeLinecap='round'/>
          </svg>
        </div>
        <div>
          <p className='font-semibold text-slate-800 text-xs'>Not sure which doctor to see?</p>
          <p className='text-slate-400 text-xs'>Describe your symptoms — we'll guide you</p>
        </div>
        <svg className='ml-auto flex-shrink-0 text-slate-400' width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
          <path d='M9 18l6-6-6-6'/>
        </svg>
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0 sm:pb-4'>
          <div className='slide-up bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden'>

            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-[var(--primary-light)] rounded-lg flex items-center justify-center'>
                  <InfoIcon size={16} />
                </div>
                <div>
                  <p className='font-sora font-semibold text-slate-900 text-sm'>Symptom Checker</p>
                  <p className='text-xs text-slate-400'>Tell us what you're experiencing</p>
                </div>
              </div>
              <button onClick={close} className='text-slate-400 hover:text-slate-600 transition-colors'>
                <svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                </svg>
              </button>
            </div>

            <div className='p-6 max-h-[75vh] overflow-y-auto'>
              {!result ? (
                <>
                  <textarea
                    ref={textareaRef}
                    value={symptom}
                    onChange={e => setSymptom(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); analyse() } }}
                    placeholder='Describe your symptoms, e.g. "I have had a fever and sore throat for 2 days..."'
                    rows={4}
                    className='w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] resize-none text-slate-800 placeholder-slate-400'
                  />
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {EXAMPLES.map(ex => (
                      <button key={ex} onClick={() => setSymptom(ex)}
                        className='text-xs border border-slate-200 rounded-md px-3 py-1.5 text-slate-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors bg-white'>
                        {ex}
                      </button>
                    ))}
                  </div>
                  {error && <ErrorBox error={error} />}
                  <button onClick={analyse} disabled={!symptom.trim() || loading}
                    className='mt-4 w-full bg-[var(--primary)] text-white text-sm font-semibold py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                    {loading ? <><SpinIcon /> Analysing your symptoms...</> : 'Analyse Symptoms'}
                  </button>
                </>
              ) : (
                <>
                  <div className='flex flex-col gap-0.5 mb-4'>
                    <ReplyLines text={result.reply} compact />
                  </div>
                  {result.speciality && (
                    <div className='mb-4'>
                      <DoctorCTA
                        speciality={result.speciality}
                        label='View Doctors'
                        onNavigate={() => { close(); navigate(`/doctors/${result.speciality}`); window.scrollTo(0, 0) }}
                      />
                    </div>
                  )}
                  <p className='text-xs text-slate-400 mb-5'>
                    This is not a medical diagnosis. Please consult a qualified doctor for proper evaluation.
                  </p>
                  <button onClick={reset}
                    className='w-full border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors'>
                    Check another symptom
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SymptomCheckerSection
