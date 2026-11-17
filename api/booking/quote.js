import { handleQuote, serveBooking } from '../../scripts/lib/booking-handlers.mjs'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

export default async function handler(req, res) {
  await serveBooking(req, res, handleQuote)
}
