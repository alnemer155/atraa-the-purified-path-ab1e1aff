import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

const SITE_NAME = "عِتَرَةً"
const SENDER_DOMAIN = "notify.atraa.xyz"
const FROM_DOMAIN = "notify.atraa.xyz"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Prayer names in Arabic
const PRAYER_LABELS: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

// Notification schedule (Riyadh timezone UTC+3)
const NOTIFICATION_SCHEDULE: { hour: number; minute: number; type: string; templateName: string; templateData: Record<string, any> }[] = [
  { hour: 7, minute: 0, type: 'dhikr', templateName: 'daily-reminder', templateData: { type: 'dhikr_morning' } },
  { hour: 8, minute: 45, type: 'quiz', templateName: 'quiz-reminder', templateData: { type: 'start' } },
  { hour: 10, minute: 0, type: 'dua', templateName: 'daily-reminder', templateData: { type: 'dua' } },
  { hour: 12, minute: 0, type: 'salawat', templateName: 'daily-reminder', templateData: { type: 'salawat' } },
  { hour: 17, minute: 0, type: 'dhikr', templateName: 'daily-reminder', templateData: { type: 'dhikr_evening' } },
  { hour: 21, minute: 20, type: 'quiz', templateName: 'quiz-reminder', templateData: { type: 'close' } },
]

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sendEmailToRecipient(
  supabase: any,
  email: string,
  templateName: string,
  templateData: Record<string, any>,
) {
  const template = TEMPLATES[templateName]
  if (!template) return

  const messageId = crypto.randomUUID()

  // Check suppression
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (suppressed) return

  // Get or create unsubscribe token
  const normalizedEmail = email.toLowerCase()
  let unsubscribeToken: string

  const { data: existingToken } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    unsubscribeToken = generateToken()
    await supabase
      .from('email_unsubscribe_tokens')
      .upsert({ token: unsubscribeToken, email: normalizedEmail }, { onConflict: 'email', ignoreDuplicates: true })

    const { data: storedToken } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()

    unsubscribeToken = storedToken?.token || unsubscribeToken
  } else {
    return // already unsubscribed
  }

  // Render email
  const html = await renderAsync(React.createElement(template.component, templateData))
  const plainText = await renderAsync(React.createElement(template.component, templateData), { plainText: true })
  const resolvedSubject = typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  // Log pending
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: email,
    status: 'pending',
  })

  // Enqueue
  const idempotencyKey = `${templateName}-${normalizedEmail}-${new Date().toISOString().split('T')[0]}`
  await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: email,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get current Riyadh time
  const now = new Date()
  const riyadhOffset = 3 * 60 // UTC+3
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const riyadhMinutes = (utcMinutes + riyadhOffset) % 1440
  const riyadhHour = Math.floor(riyadhMinutes / 60)
  const riyadhMinute = riyadhMinutes % 60

  // Find matching scheduled notifications (within 5-minute window)
  const matchingSchedules = NOTIFICATION_SCHEDULE.filter(s => {
    const schedMinutes = s.hour * 60 + s.minute
    const currentMinutes = riyadhHour * 60 + riyadhMinute
    return Math.abs(currentMinutes - schedMinutes) <= 2
  })

  if (matchingSchedules.length === 0) {
    return new Response(JSON.stringify({ message: 'No notifications due' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let totalSent = 0

  for (const schedule of matchingSchedules) {
    // Get all users who want this notification type
    const { data: prefs, error } = await supabase
      .from('email_notification_prefs')
      .select('email')
      .eq(schedule.type, true)

    if (error || !prefs) continue

    for (const pref of prefs) {
      try {
        await sendEmailToRecipient(supabase, pref.email, schedule.templateName, schedule.templateData)
        totalSent++
      } catch (e) {
        console.error(`Failed to send to ${pref.email}:`, e)
      }
    }
  }

  return new Response(JSON.stringify({ success: true, sent: totalSent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
