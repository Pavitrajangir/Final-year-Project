import userModel from '../models/userModel.js'

/**
 * POST /api/sos/send
 * Body: { latitude, longitude, address }  (from browser GPS)
 * Auth: requires token header (authUser middleware)
 *
 * Sends a WhatsApp message to the patient's emergencyContact number
 * using Twilio's WhatsApp sandbox/API.
 *
 * Required .env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   (e.g. whatsapp:+14155238886  ← Twilio sandbox number)
 */
export const sendSOS = async (req, res) => {
  try {
    const userId = req.userId
    const { latitude, longitude, address } = req.body

    // ── 1. Load patient data ──────────────────────────────────────────────────
    const user = await userModel.findById(userId).select('-password')
    if (!user) return res.json({ success: false, message: 'User not found' })

    const emergencyContact = user.emergencyContact?.trim()
    if (!emergencyContact) {
      return res.json({
        success: false,
        message: 'No emergency contact saved. Please add one in your profile first.'
      })
    }

    // ── 2. Build the alert message ────────────────────────────────────────────
    const mapsLink = latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : null

    const locationText = mapsLink
      ? `📍 Live Location: ${mapsLink}\n🗺️ Address: ${address || 'See map link'}`
      : `📍 Location unavailable (GPS denied)`

    const message = [
      `🚨 *EMERGENCY SOS ALERT* 🚨`,
      ``,
      `*${user.name}* needs immediate help!`,
      ``,
      locationText,
      ``,
      `🩺 *Medical Info:*`,
      `• Blood Group: ${user.bloodGroup  || 'Not specified'}`,
      `• Conditions:  ${user.conditions  || 'None'}`,
      `• Allergies:   ${user.allergies   || 'None'}`,
      `• Medications: ${user.medications || 'None'}`,
      ``,
      `📞 Contact: ${user.phone || 'Not provided'}`,
      ``,
      `_Sent via MediMate Emergency SOS_`,
    ].join('\n')

    // ── 3. Check Twilio credentials ───────────────────────────────────────────
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken  = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !fromNumber ||
        accountSid === 'your_twilio_account_sid') {
      // ── DEMO MODE: Twilio not configured, return success with message preview
      console.log('⚠️  Twilio not configured — SOS demo mode')
      console.log('Would send to:', emergencyContact)
      console.log('Message:', message)
      return res.json({
        success:   true,
        demo:      true,
        message:   'SOS alert prepared (Twilio not configured — see server logs)',
        recipient: emergencyContact,
        preview:   message,
      })
    }

    // ── 4. Send via Twilio WhatsApp API ───────────────────────────────────────
    // Normalize the to-number: ensure it starts with whatsapp:+
    let toNumber = emergencyContact
    if (!toNumber.startsWith('whatsapp:')) {
      if (!toNumber.startsWith('+')) toNumber = '+' + toNumber
      toNumber = `whatsapp:${toNumber}`
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const body      = new URLSearchParams({
      From: fromNumber,      // e.g. whatsapp:+14155238886
      To:   toNumber,        // e.g. whatsapp:+919876543210
      Body: message,
    })

    const response = await fetch(twilioUrl, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
      body: body.toString(),
    })

    const twilioData = await response.json()

    if (twilioData.error_code) {
      console.error('Twilio error:', twilioData)
      return res.json({
        success: false,
        message: `WhatsApp send failed: ${twilioData.message}`,
      })
    }

    console.log(`✅ SOS WhatsApp sent to ${toNumber} — SID: ${twilioData.sid}`)
    res.json({
      success:   true,
      message:   `Emergency alert sent to ${emergencyContact} via WhatsApp`,
      messageSid: twilioData.sid,
    })

  } catch (err) {
    console.error('SOS controller error:', err.message)
    res.json({ success: false, message: `SOS failed: ${err.message}` })
  }
}
