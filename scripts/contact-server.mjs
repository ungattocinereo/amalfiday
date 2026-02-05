import http from 'node:http'
import handler from '../api/contact.js'

const port = Number(process.env.CONTACT_API_PORT || process.env.PORT || 8787)

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (url.pathname !== '/api/contact') {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    req.body = body
    res.status = (code) => {
      res.statusCode = code
      return res
    }
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    }
    handler(req, res)
  })
})

server.listen(port, () => {
  console.log(`[contact-api] listening on http://localhost:${port}/api/contact`)
})
