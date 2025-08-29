import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/tab-capture'
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await request.text(),
  })
  const body = await res.text()
  return new Response(body, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

<<<<<<< Current (Your changes)
export async function GET() {
  return NextResponse.json({ message: 'Tab capture API endpoint' });
=======
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  url.pathname = '/api/tab-capture'
  const res = await fetch(url.toString())
  const body = await res.text()
  return new Response(body, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
>>>>>>> Incoming (Background Agent changes)
} 