import { NextRequest } from 'next/server'
import { getJob } from '@/lib/tab-capture-store'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      async function push() {
        const job = await getJob(jobId)
        if (!job) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Job not found' })}\n\n`)
          )
          controller.close()
          return
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'job_update', job })}\n\n`))

        if (job.status === 'completed' || job.status === 'failed') {
          controller.close()
          return
        }

        setTimeout(push, 1000)
      }

      push()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
<<<<<<< Current (Your changes)
  });
=======
  })
>>>>>>> Incoming (Background Agent changes)
} 