import { setupPhotoDialog } from './photo-dialog'

const request = document.querySelector<HTMLDialogElement>('#gs-request')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

if (request) {
  const openRequest = setupPhotoDialog(request)
  const form = document.querySelector<HTMLFormElement>('#gs-request-form')!
  const started = form.elements.namedItem('_form_started_at') as HTMLInputElement
  let openingRequest = false
  document.querySelectorAll<HTMLElement>('[data-request]').forEach(button => button.addEventListener('click', async event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (openingRequest || request.open) return
    openingRequest = true
    let cancelled = false
    const cancelOpening = (event: KeyboardEvent) => { if (event.key === 'Escape') cancelled = true }
    document.addEventListener('keydown', cancelOpening)
    button.setAttribute('aria-busy', 'true')
    try {
      // A brief shutter-like response belongs to the button, then the dialog takes over.
      // Only transform and opacity animate; there is no frame loop or idle animation.
      if (!reduced.matches) {
        button.classList.add('is-opening')
        await button.animate([
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(1px) scale(.975)', offset: .3 },
          { transform: 'translateY(0) scale(1)' },
        ], { duration: 280, easing: 'cubic-bezier(.22, 1, .36, 1)' }).finished
      }
      if (!cancelled) {
        if (!started.value) started.value = String(Date.now())
        openRequest(button)
      }
    } finally {
      button.classList.remove('is-opening')
      button.removeAttribute('aria-busy')
      document.removeEventListener('keydown', cancelOpening)
      openingRequest = false
    }
  }))
  const contact = form.elements.namedItem('contact') as HTMLInputElement
  const contactKind = () => {
    const value = contact.value.trim()
    if (value.includes('@')) return 'email'
    if (/^\+?[\d\s().-]+$/.test(value)) return 'whatsapp'
    return 'unknown'
  }
  const updateContact = () => {
    contact.setCustomValidity('')
    form.querySelector<HTMLElement>('.gs-contact-field')!.dataset.contactKind = contactKind()
  }
  contact.addEventListener('input', updateContact)
  contact.addEventListener('change', updateContact)
  const date = form.elements.namedItem('dates') as HTMLInputElement
  const today = new Date()
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const status = form.querySelector<HTMLElement>('.gs-form-status')!
  const send = form.querySelector<HTMLButtonElement>('[type="submit"]')!
  const setStatus = (message: string, error = false) => { status.textContent = message; status.dataset.error = String(error) }
  const cooldownKey = 'amalfi-contact-last-submit-at'
  const post = async (endpoint: string, body: Record<string, unknown>) => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 12000)
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: controller.signal })
      if (!response.ok) throw Object.assign(new Error('Request failed'), { fallback: response.status >= 500 || response.status === 404, status: response.status })
      const result = await response.json().catch(() => null)
      // The API returns { ok: true }; the existing webhook accepts a JSON response without an error.
      const confirmed = result && typeof result === 'object' && !Array.isArray(result) && !result.error && result.ok !== false && result.success !== false
      if (!confirmed || (endpoint === '/api/contact' && result.ok !== true)) throw Object.assign(new Error('Invalid response'), { fallback: true })
    } catch (error) {
      if (error instanceof TypeError) throw Object.assign(error, { fallback: true })
      throw error
    } finally { window.clearTimeout(timer) }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (send.disabled) return
    const replyMethod = contactKind() === 'email' ? 'Email' : 'WhatsApp'
    const digits = contact.value.replace(/\D/g, '')
    const valid = replyMethod === 'Email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value.trim()) : /^\+?[\d\s().-]+$/.test(contact.value.trim()) && digits.length >= 7 && digits.length <= 15
    contact.setCustomValidity(valid ? '' : 'Please enter an email address or a WhatsApp number with country code.')
    if (!form.reportValidity()) return
    if (Date.now() - Number(started.value) < 3500) { setStatus('Please take a moment, then send your request.', true); return }
    try {
      const last = Number(localStorage.getItem(cooldownKey) || 0)
      if (Date.now() - last < 60000) { setStatus('Please wait one minute before sending another request.', true); return }
    } catch { /* Storage can be unavailable in private browsing. */ }
    const values = Object.fromEntries(new FormData(form).entries())
    if (!String(values.name).trim()) { setStatus('Please enter your name.', true); (form.elements.namedItem('name') as HTMLInputElement).focus(); return }
    if (String(values.company_website || '').trim()) { setStatus('Unable to send this request. Please use the contact page.', true); return }
    const payload = {
      ...values,
      name: String(values.name).trim(),
      contact: contact.value.trim(),
      reply_method: replyMethod,
      dates: values.dates || 'Dates flexible',
      service: 'Photoshooting',
      message: `Preferred reply: ${replyMethod}\nPhotoshoot: ${values.shoot_type || 'To be decided'}\n${values.message || ''}`,
      page: window.location.href,
      referrer: window.location.href,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    send.disabled = true
    form.setAttribute('aria-busy', 'true')
    setStatus('Sending your request…')
    try {
      try { await post('/api/contact', payload) }
      catch (error) {
        if (!(error as { fallback?: boolean }).fallback) throw error
        await post('/hooks/send-telegram-amalfiday', payload)
      }
      try { localStorage.setItem(cooldownKey, String(Date.now())) } catch { /* Optional cooldown persistence. */ }
      if (!reduced.matches) await form.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180 }).finished
      form.hidden = true
      request.querySelector<HTMLElement>('.gs-request__intro')!.hidden = true
      const success = request.querySelector<HTMLElement>('.gs-success')!
      success.hidden = false
      if (request.open) success.focus()
    } catch (error) {
      setStatus((error as { status?: number }).status === 429 ? 'Too many requests. Please try again in a few minutes.' : 'Your request could not be confirmed. Please try again, or use the contact page.', true)
      if (!status.querySelector('a')) {
        const link = document.createElement('a')
        link.href = '/contact'
        link.textContent = ' Open contact page.'
        status.append(link)
      }
    } finally {
      send.disabled = false
      form.removeAttribute('aria-busy')
    }
  })
}
