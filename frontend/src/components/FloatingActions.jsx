import React, { useContext, useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const FloatingActions = () => {
  const { token, userData } = useContext(AppContext)
  const location = useLocation()
  const [showAI,    setShowAI]    = useState(false)
  const [sosActive, setSosActive] = useState(false)

  const allowed = ['/', '/my-profile']
  if (!token || !allowed.includes(location.pathname)) return null

  return (
    <>
      <div className='fixed bottom-6 right-6 flex flex-col items-center gap-3 z-40'>
        <Tooltip label='AI Assistant'>
          <button onClick={() => setShowAI(true)}
            className='w-12 h-12 bg-gradient-to-br from-secondary to-purple-700 text-white rounded-full
                       shadow-lg shadow-purple-400/40 hover:scale-110 transition-all flex items-center justify-center'>
            <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'>
              <circle cx='12' cy='12' r='3'/>
              <path d='M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12' strokeLinecap='round'/>
            </svg>
          </button>
        </Tooltip>
        <Tooltip label='Emergency SOS'>
          <button onClick={() => setSosActive(true)}
            className='pulse-ring relative w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full
                       shadow-lg shadow-red-400/50 hover:scale-110 transition-all flex items-center justify-center
                       font-sora font-bold text-sm'>
            SOS
          </button>
        </Tooltip>
      </div>

      {showAI    && <AIChatPanel onClose={() => setShowAI(false)}   userData={userData} />}
      {sosActive && <SOSModal    onClose={() => setSosActive(false)} userData={userData} />}
    </>
  )
}

// Small tooltip wrapper
const Tooltip = ({ label, children }) => (
  <div className='relative group'>
    {children}
    <span className='absolute right-16 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2.5 py-1
                     rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
      {label}
    </span>
  </div>
)

// Spinner icon shared across panels
const Spinner = ({ size = 14 }) => (
  <svg className='animate-spin' width={size} height={size} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
    <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// AI CHAT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const AIChatPanel = ({ onClose, userData }) => {
  const { backendUrl, token } = useContext(AppContext)

  const [messages,     setMessages]     = useState([{
    role: 'assistant',
    text: `Hello ${userData?.name?.split(' ')[0] || 'there'}. I'm your MediMate AI health assistant. I know your full health profile and past consultations. Ask me anything about your health, medicines, or scan a product barcode.`
  }])
  const [input,        setInput]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [isListening,  setIsListening]  = useState(false)
  const [appointments, setAppointments] = useState([])

  // Barcode: 'none' | 'manual' | 'camera'
  const [scanMode,       setScanMode]       = useState('none')
  const [barcode,        setBarcode]        = useState('')
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [cameraStatus,   setCameraStatus]   = useState('idle') // idle | starting | scanning | error
  const [cameraError,    setCameraError]    = useState('')

  const chatRef        = useRef(null)
  const recognitionRef = useRef(null)
  const videoRef       = useRef(null)
  const canvasRef      = useRef(null)
  const scannerRef     = useRef({ active: false })
  const fileInputRef   = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  // Fetch completed appointments for AI context
  useEffect(() => {
    if (!token) return
    fetch(`${backendUrl}/api/user/appointments-with-notes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', token },
      body:    JSON.stringify({}),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setAppointments(d.appointments || []) })
      .catch(() => {})
  }, [token])

  // Stop camera when leaving camera mode
  useEffect(() => {
    if (scanMode !== 'camera') stopCamera()
    return () => stopCamera()
  }, [scanMode])

  const stopCamera = () => {
    scannerRef.current.active = false
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraStatus('idle')
  }

  const startLiveCamera = async () => {
    setCameraError('')
    setCameraStatus('starting')
    scannerRef.current.active = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
      })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraStatus('scanning')

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code','itf','data_matrix']
        })
        const scan = async () => {
          if (!scannerRef.current.active || !videoRef.current) return
          try {
            const results = await detector.detect(videoRef.current)
            if (results.length > 0) {
              stopCamera(); setScanMode('none')
              lookupAndAnalyse(results[0].rawValue)
              return
            }
          } catch {}
          if (scannerRef.current.active) setTimeout(scan, 250)
        }
        setTimeout(scan, 800)
      } else {
        setCameraError('Auto-detect not available on this browser. Point at barcode then tap "Capture".')
      }
    } catch (err) {
      scannerRef.current.active = false
      setCameraStatus('error')
      if (err.name === 'NotAllowedError') setCameraError('Camera permission denied. Please allow camera access.')
      else if (err.name === 'NotFoundError') setCameraError('No camera found on this device.')
      else setCameraError('Camera unavailable. Please use manual barcode entry.')
    }
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current, canvas = canvasRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    if (!('BarcodeDetector' in window)) return
    try {
      const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'] })
      const results = await detector.detect(canvas)
      if (results.length > 0) { stopCamera(); setScanMode('none'); lookupAndAnalyse(results[0].rawValue) }
      else { setCameraError('No barcode detected. Hold steady and try again.'); setTimeout(() => setCameraError(''), 2000) }
    } catch { setCameraError('Capture failed. Try again.') }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = async () => {
      if (!('BarcodeDetector' in window)) { setCameraError('Barcode reading not supported. Use manual entry.'); return }
      try {
        const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'] })
        const results = await detector.detect(img)
        if (results.length > 0) { setScanMode('none'); lookupAndAnalyse(results[0].rawValue) }
        else setCameraError('No barcode found in photo. Try a clearer image.')
      } catch { setCameraError('Could not read photo. Try manual entry.') }
    }
  }

  const lookupAndAnalyse = async (code) => {
    if (!code?.trim()) return
    setScanMode('none'); setBarcode('')
    setBarcodeLoading(true)
    setMessages(prev => [...prev, { role: 'user', text: `Scanning barcode: ${code}` }])

    try {
      let product = null

      // Try three databases in order: food, beauty, general
      for (const base of ['world.openfoodfacts.org', 'world.openbeautyfacts.org', 'world.openproductsfacts.org']) {
        if (product?.name) break
        try {
          const r = await fetch(`https://${base}/api/v0/product/${code}.json`)
          const d = await r.json()
          if (d.status === 1 && d.product) {
            const p = d.product
            product = {
              name:        p.product_name || p.product_name_en || '',
              brand:       p.brands || '',
              category:    p.categories || p.food_groups || '',
              ingredients: p.ingredients_text || p.ingredients_text_en || '',
              allergens:   p.allergens_tags?.map(a => a.replace('en:', '')).join(', ') || '',
              nutriscore:  p.nutriscore_grade?.toUpperCase() || '',
              energy:      p.nutriments?.['energy-kcal_100g'] ? `${p.nutriments['energy-kcal_100g']} kcal/100g` : '',
              sugar:       p.nutriments?.['sugars_100g']      ? `${p.nutriments['sugars_100g']}g/100g` : '',
              fat:         p.nutriments?.['fat_100g']         ? `${p.nutriments['fat_100g']}g/100g` : '',
              protein:     p.nutriments?.['proteins_100g']    ? `${p.nutriments['proteins_100g']}g/100g` : '',
              sodium:      p.nutriments?.['sodium_100g']      ? `${p.nutriments['sodium_100g']}g/100g` : '',
            }
          }
        } catch {}
      }

      let query = ''
      if (product?.name) {
        const details = [
          product.nutriscore && `Nutri-Score: ${product.nutriscore}`,
          product.energy  && `Energy: ${product.energy}`,
          product.sugar   && `Sugar: ${product.sugar}`,
          product.fat     && `Fat: ${product.fat}`,
          product.protein && `Protein: ${product.protein}`,
          product.sodium  && `Sodium: ${product.sodium}`,
        ].filter(Boolean).join('\n')

        query = `Analyse this product for my health profile:

Product: ${product.name}${product.brand ? ` by ${product.brand}` : ''}
Category: ${product.category}
Ingredients: ${product.ingredients || 'See label'}
Allergens: ${product.allergens || 'None listed'}
${details}

Please:
1. Summarise what this product is and what it's used for
2. Key health benefits and risks based on its ingredients
3. Clear YES or NO — should I use/consume this given my health profile? Why?`

      } else {
        const prefix = code.substring(0, 3)
        const hints  = { '890': 'Indian', '400': 'German', '410': 'German', '300': 'French', '310': 'French', '00': 'US/Canada', '01': 'US/Canada' }
        const country = Object.entries(hints).find(([k]) => code.startsWith(k))?.[1] || ''
        query = `I scanned a product with barcode ${code}.${country ? ` This appears to be a ${country} product.` : ''}

Not found in any database. Please:
1. Try to identify this product or product type from your training knowledge
2. Give general safety and health advice for this type of product
3. List ingredients or components I should check on the label given my health conditions`
      }

      setBarcodeLoading(false)
      sendMessage(query, true)
    } catch {
      setBarcodeLoading(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Could not look up barcode. Please check your internet connection or type the product name directly.'
      }])
    }
  }

  const buildSystemPrompt = () => {
    let age = ''
    if (userData?.dob) {
      const years = Math.floor((Date.now() - new Date(userData.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      age = `${years} years old`
    }

    const profile = userData ? [
      `Name: ${userData.name}`,
      age && `Age: ${age}`,
      userData.gender      && `Gender: ${userData.gender}`,
      userData.bloodGroup  && `Blood Group: ${userData.bloodGroup}`,
      `Medical Conditions: ${userData.conditions  || 'None known'}`,
      `Allergies: ${userData.allergies   || 'None known'}`,
      `Current Medications: ${userData.medications || 'None'}`,
      userData.phone && `Phone: ${userData.phone}`,
    ].filter(Boolean).join('\n') : 'No profile available'

    const pastConsultations = appointments.length > 0
      ? appointments.map(apt => {
          const notes = [
            apt.diagnosis    && `Diagnosis: ${apt.diagnosis}`,
            apt.prescription && `Prescription: ${apt.prescription}`,
            apt.advice       && `Doctor Advice: ${apt.advice}`,
          ].filter(Boolean)
          return [
            `• ${apt.slotDate?.replace(/_/g, '/')} — ${apt.docData?.name}${apt.docData?.speciality ? ` (${apt.docData.speciality})` : ''}`,
            ...notes.map(n => `  - ${n}`)
          ].join('\n')
        }).join('\n')
      : 'No completed appointments yet.'

    return `You are MediMate AI, a personal health assistant with the patient's complete profile and history.

PATIENT PROFILE:
${profile}

PAST CONSULTATIONS:
${pastConsultations}

INSTRUCTIONS:
- Personalise all advice based on this patient's conditions, allergies, medications, and doctor notes
- For product/barcode analysis: give a clear YES/NO recommendation based on their profile
- For medicine questions: check for interactions with current medications
- Be concise, use bullet points, and speak like a caring assistant
- Always recommend consulting a doctor for serious concerns`
  }

  const sendMessage = async (text, skipUserBubble = false) => {
    if (!text?.trim() || loading) return
    if (!skipUserBubble) setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const history    = messages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.text }))
      const apiMessages = [...history, { role: 'user', content: text }]
      const resp = await fetch(`${backendUrl}/api/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: apiMessages, systemPrompt: buildSystemPrompt() }),
      })
      const data = await resp.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.success ? data.reply : (data.message || 'Something went wrong. Please try again.')
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Cannot reach server. Make sure the backend is running on port 4000.' }])
    } finally {
      setLoading(false)
    }
  }

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice input not supported. Please use Chrome or Edge.'); return }
    recognitionRef.current = new SR()
    recognitionRef.current.lang        = 'en-IN'
    recognitionRef.current.continuous  = false
    recognitionRef.current.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false) }
    recognitionRef.current.onerror  = () => setIsListening(false)
    recognitionRef.current.onend    = () => setIsListening(false)
    recognitionRef.current.start()
    setIsListening(true)
  }

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false) }

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-end p-4 bg-black/30 backdrop-blur-sm'
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className='slide-up bg-white rounded-3xl shadow-2xl w-full max-w-md h-[88vh] flex flex-col overflow-hidden border border-slate-200'>

        {/* Header */}
        <div className='bg-gradient-to-r from-secondary to-purple-700 px-5 py-4 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
              <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='white' strokeWidth='1.8'>
                <circle cx='12' cy='12' r='3'/>
                <path d='M12 2v3M12 19v3M2 12h3M19 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12' strokeLinecap='round'/>
              </svg>
            </div>
            <div>
              <p className='font-sora font-semibold text-white text-sm'>MediMate AI</p>
              <p className='text-white/70 text-xs'>Powered by Groq</p>
            </div>
          </div>
          <button onClick={onClose} className='text-white/80 hover:text-white transition-colors'>
            <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
              <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
            </svg>
          </button>
        </div>

        {/* Quick chips */}
        <div className='px-4 py-3 flex gap-2 flex-wrap flex-shrink-0 border-b border-slate-100 bg-slate-50'>
          {['I have a headache', 'Diet advice for diabetes', 'Scan product barcode'].map(chip => (
            <button key={chip}
              onClick={() => chip.includes('barcode') ? setScanMode('manual') : sendMessage(chip)}
              className='text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-secondary/50 hover:text-secondary transition-colors'>
              {chip}
            </button>
          ))}
        </div>

        {/* Manual barcode entry */}
        {scanMode === 'manual' && (
          <div className='px-4 py-3 bg-amber-50 border-b border-amber-200 flex-shrink-0'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-xs font-semibold text-amber-800'>Enter Barcode Number</p>
              <div className='flex gap-1.5'>
                <button onClick={() => { setScanMode('camera'); startLiveCamera() }}
                  className='flex items-center gap-1 text-xs bg-slate-800 text-white px-2.5 py-1.5 rounded-full hover:bg-slate-700 transition-colors'>
                  <svg width='11' height='11' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                    <path d='M23 7l-7 5 7 5V7z'/><rect x='1' y='5' width='15' height='14' rx='2'/>
                  </svg>
                  Live Scan
                </button>
                <label className='flex items-center gap-1 text-xs bg-amber-500 text-white px-2.5 py-1.5 rounded-full hover:bg-amber-600 cursor-pointer'>
                  <svg width='11' height='11' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                    <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/>
                    <circle cx='12' cy='13' r='4'/>
                  </svg>
                  Take Photo
                  <input ref={fileInputRef} type='file' accept='image/*' capture='environment' className='hidden' onChange={handlePhotoUpload} />
                </label>
                <button onClick={() => { setScanMode('none'); setBarcode('') }} className='text-slate-400 hover:text-slate-600 text-lg px-1'>&times;</button>
              </div>
            </div>
            <div className='flex gap-2'>
              <input
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder='e.g. 4890008100309'
                className='flex-1 text-sm border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 bg-white'
                onKeyDown={e => e.key === 'Enter' && lookupAndAnalyse(barcode.trim())}
                autoFocus
              />
              <button onClick={() => lookupAndAnalyse(barcode.trim())}
                className='bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors'>
                Look Up
              </button>
            </div>
            <p className='text-xs text-amber-600 mt-1.5'>
              Try:{' '}
              <span className='cursor-pointer underline' onClick={() => setBarcode('4890008100309')}>4890008100309</span> (Mountain Dew) ·{' '}
              <span className='cursor-pointer underline' onClick={() => setBarcode('8901030890006')}>8901030890006</span> (Maggi)
            </p>
          </div>
        )}

        {/* Live camera scanner */}
        {scanMode === 'camera' && (
          <div className='bg-slate-900 border-b border-slate-700 flex-shrink-0'>
            <div className='flex items-center justify-between px-4 pt-3 pb-2'>
              <p className='text-xs font-semibold text-white'>
                {cameraStatus === 'starting' ? 'Starting camera...' : 'Point at barcode — auto scanning'}
              </p>
              <div className='flex gap-2'>
                <button onClick={() => setScanMode('manual')} className='text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full hover:bg-slate-600'>Manual</button>
                <button onClick={() => setScanMode('none')} className='text-slate-400 hover:text-white text-lg'>&times;</button>
              </div>
            </div>
            <div className='relative mx-4 mb-3 rounded-xl overflow-hidden bg-black' style={{ height: '160px' }}>
              <video ref={videoRef} className='w-full h-full object-cover' muted playsInline autoPlay />
              <canvas ref={canvasRef} className='hidden' />
              {/* Scan frame overlay */}
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='w-52 h-28 relative'>
                  {[['top-0 left-0','border-t-4 border-l-4'],['top-0 right-0','border-t-4 border-r-4'],['bottom-0 left-0','border-b-4 border-l-4'],['bottom-0 right-0','border-b-4 border-r-4']].map(([pos, border]) => (
                    <div key={pos} className={`absolute ${pos} w-6 h-6 ${border} border-amber-400`} />
                  ))}
                  {cameraStatus === 'scanning' && <div className='absolute top-1/2 left-2 right-2 h-0.5 bg-amber-400/80 animate-bounce' />}
                </div>
              </div>
              {cameraStatus === 'starting' && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs text-center'>
                  <div><Spinner size={20} /><p className='mt-1'>Starting camera...</p></div>
                </div>
              )}
            </div>
            {(cameraStatus === 'scanning' || cameraError) && (
              <div className='px-4 pb-3 flex flex-col gap-2'>
                {cameraError && (
                  <div className='bg-amber-900/60 border border-amber-600 rounded-xl p-2.5 text-xs text-amber-200'>
                    {cameraError}
                  </div>
                )}
                <button onClick={captureFrame}
                  className='w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-bold py-3 rounded-xl transition-all'>
                  Capture Barcode
                </button>
              </div>
            )}
          </div>
        )}

        {/* Barcode lookup indicator */}
        {barcodeLoading && (
          <div className='px-4 py-2 bg-amber-50 border-b border-amber-100 flex-shrink-0 flex items-center gap-2 text-xs text-amber-700'>
            <Spinner size={12} /> Looking up product in database...
          </div>
        )}

        {/* Messages */}
        <div ref={chatRef} className='flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4'>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-purple-700 flex items-center justify-center flex-shrink-0 mt-1'>
                  <svg width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='white' strokeWidth='1.8'>
                    <circle cx='12' cy='12' r='3'/>
                    <path d='M12 2v3M12 19v3M2 12h3M19 12h3' strokeLinecap='round'/>
                  </svg>
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-secondary to-purple-700 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {(loading || barcodeLoading) && (
            <div className='flex gap-2'>
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-purple-700 flex items-center justify-center'>
                <svg width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='white' strokeWidth='1.8'>
                  <circle cx='12' cy='12' r='3'/>
                </svg>
              </div>
              <div className='bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1 h-10'>
                {[0,1,2].map(i => (
                  <span key={i} className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className='px-4 py-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0 bg-white'>
          <button onClick={() => setScanMode(scanMode === 'manual' ? 'none' : 'manual')} title='Scan barcode'
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
              ${scanMode !== 'none' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
              <rect x='3' y='3' width='4' height='4'/><rect x='17' y='3' width='4' height='4'/>
              <rect x='3' y='17' width='4' height='4'/>
              <path d='M17 17h4v4M11 3v18M3 11h18' strokeLinecap='round'/>
            </svg>
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder={isListening ? 'Listening...' : 'Ask about your health...'}
            className='flex-1 text-sm border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-secondary/50 bg-slate-50'
            disabled={loading}
          />
          <button onClick={isListening ? stopVoice : startVoice}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
              ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
              <path d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z'/>
              <path d='M19 10v2a7 7 0 0 1-14 0v-2' strokeLinecap='round'/>
              <line x1='12' y1='19' x2='12' y2='23' strokeLinecap='round'/>
              <line x1='8'  y1='23' x2='16' y2='23' strokeLinecap='round'/>
            </svg>
          </button>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className='w-9 h-9 bg-gradient-to-r from-secondary to-purple-700 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-40 flex-shrink-0'>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2.5'>
              <path d='M5 12h14M12 5l7 7-7 7' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SOS MODAL
// ─────────────────────────────────────────────────────────────────────────────
const SOSModal = ({ onClose, userData }) => {
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(true)

  const isMobile   = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const hasContact = !!userData?.emergencyContact?.trim()
  const rawNumber  = userData?.emergencyContact?.trim() || ''
  const waNumber   = rawNumber.replace(/\D/g, '')

  useEffect(() => {
    if (!navigator.geolocation) { setLocation({ lat: null, address: 'GPS not supported' }); setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const d = await r.json()
          if (d?.display_name) address = d.display_name
        } catch {}
        setLocation({ lat, lng, address })
        setLocating(false)
      },
      () => { setLocation({ lat: null, address: 'Location access denied' }); setLocating(false) },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [])

  const waMessage = () => {
    const mapsLink = location?.lat ? `https://maps.google.com/?q=${location.lat},${location.lng}` : null
    const lines = [
      '*EMERGENCY SOS*',
      `*${userData?.name || 'Patient'}* needs immediate help!`,
      mapsLink ? `Location: ${mapsLink}` : 'Location unavailable',
      location?.address && location?.lat ? location.address : '',
      '',
      '*Medical Info*',
      `Blood: ${userData?.bloodGroup  || 'Not set'}`,
      `Conditions: ${userData?.conditions  || 'None'}`,
      `Allergies: ${userData?.allergies   || 'None'}`,
      `Medications: ${userData?.medications || 'None'}`,
      userData?.phone || '',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4'>
      <div className='slide-up bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden'>

        {/* Header */}
        <div className='bg-gradient-to-r from-red-500 to-red-700 px-6 py-5 text-center relative'>
          <button onClick={onClose} className='absolute top-4 right-4 text-white/70 hover:text-white transition-colors'>
            <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
              <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
            </svg>
          </button>
          <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3'>
            <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='white' strokeWidth='2'>
              <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/>
              <line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/>
            </svg>
          </div>
          <h2 className='font-sora font-bold text-white text-xl'>Emergency SOS</h2>
          <p className='text-red-100 text-xs mt-1'>
            {hasContact ? rawNumber : 'Add emergency contact in Profile first'}
          </p>
        </div>

        <div className='p-5 flex flex-col gap-3'>

          {/* Ambulance */}
          <a href='tel:108'
            className='flex items-center gap-4 bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 hover:bg-red-100 active:scale-95 transition-all'>
            <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
              <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='#dc2626' strokeWidth='2'>
                <path d='M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 10.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/>
              </svg>
            </div>
            <div className='flex-1'>
              <p className='font-sora font-bold text-red-800 text-sm'>Call Ambulance</p>
              <p className='text-red-500 text-xs'>Tap to dial 108 instantly</p>
            </div>
            <p className='text-red-600 text-2xl font-black'>108</p>
          </a>

          {/* GPS status */}
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs border
            ${locating ? 'bg-amber-50 border-amber-200 text-amber-700'
              : location?.lat ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            {locating
              ? <><Spinner size={13} /><span>Getting your GPS location...</span></>
              : <>
                  <svg width='13' height='13' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                    <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/>
                  </svg>
                  <span className='line-clamp-2 leading-snug'>{location?.address || 'Location unavailable'}</span>
                </>
            }
          </div>

          {/* Contact actions */}
          {hasContact ? (
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-semibold text-slate-500 px-1'>Contact: {rawNumber}</p>
              {isMobile ? (
                <div className='grid grid-cols-2 gap-2'>
                  <a href={`tel:${rawNumber}`}
                    className='flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-sora font-bold py-3.5 rounded-2xl transition-all'>
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2.5'>
                      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/>
                    </svg>
                    Call
                  </a>
                  <a href={waMessage()} target='_blank' rel='noreferrer'
                    className='flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5c] active:scale-95 text-white font-sora font-bold py-3.5 rounded-2xl transition-all'>
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                </div>
              ) : (
                <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3'>
                  <div>
                    <p className='text-xs text-slate-500 mb-0.5'>Call from your phone</p>
                    <p className='font-sora font-bold text-slate-800 text-base'>{rawNumber}</p>
                  </div>
                  <a href={waMessage()} target='_blank' rel='noreferrer'
                    className='flex items-center justify-center gap-2 bg-[#25D366] text-white font-sora font-semibold py-3 rounded-xl text-sm hover:bg-[#1ebe5c] transition-colors'>
                    <WhatsAppIcon /> Send WhatsApp Message with Location
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className='bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3'>
              <p className='font-bold text-xs text-amber-800 mb-0.5'>No emergency contact saved</p>
              <p className='text-xs text-amber-700'>Go to <strong>My Profile → Emergency Contact</strong> and add a number.</p>
            </div>
          )}

          {/* Medical ID */}
          <div className='bg-rose-50 border border-rose-200 rounded-xl px-4 py-3'>
            <p className='font-sora font-semibold text-rose-800 text-xs mb-1.5'>Medical ID</p>
            <div className='grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5 text-xs text-rose-700'>
              <span className='font-semibold'>Patient:</span>    <span>{userData?.name     || '—'}</span>
              <span className='font-semibold'>Blood:</span>      <span>{userData?.bloodGroup || 'Not set'}</span>
              <span className='font-semibold'>Conditions:</span> <span>{userData?.conditions || 'None'}</span>
              <span className='font-semibold'>Allergies:</span>  <span>{userData?.allergies  || 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WhatsAppIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z'/>
    <path d='M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.57a.75.75 0 0 0 .916.919l5.849-1.483A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.679-.505-5.215-1.388l-.374-.217-3.876.983.999-3.76-.236-.386A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'/>
  </svg>
)

export default FloatingActions
