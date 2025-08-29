import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const url = new URL(request.url)
  url.pathname = `/api/tab-capture/${jobId}`
  const res = await fetch(url.toString(), { headers: { Accept: 'text/event-stream' } })
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
<<<<<<< Current (Your changes)
  });
=======
  })
>>>>>>> Incoming (Background Agent changes)
} 