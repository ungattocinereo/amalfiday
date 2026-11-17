// Single source of truth for how direct booking works today, shared by
// BookingPanel.astro and DirectBooking.astro.
// 'request': the guest sends a request through the contact form and we confirm by message.
// 'instant': online payment and instant confirmation (later plan).
export const BOOKING_MODE = 'request'
