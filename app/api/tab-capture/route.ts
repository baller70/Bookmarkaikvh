import { NextRequest, NextResponse } from 'next/server'
import { createJob, saveJob, updateTab, type CapturedTab, type BrowserLauncherPrefs } from '@/lib/tab-capture-store'

export const runtime = 'nodejs'

interface TabCaptureRequest {
  tabs: CapturedTab[]
  prefs: BrowserLauncherPrefs
}

export async function POST(request: NextRequest) {
  try {
    const body: TabCaptureRequest = await request.json()
    const { tabs, prefs } = body

    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
      return NextResponse.json({ error: 'Invalid tabs data' }, { status: 400 })
    }

    if (tabs.length > prefs.maxTabs) {
      return NextResponse.json({ error: `Too many tabs. Maximum allowed: ${prefs.maxTabs}` }, { status: 400 })
    }

    const job = await createJob(tabs, prefs)

    // Fire-and-forget async processing (no await)
    ;(async () => {
      for (let i = 0; i < job.tabs.length; i++) {
        const tabIndex = i
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
        await updateTab(job.id, (j) => {
          const tab = j.tabs[tabIndex]
          const isDuplicate = Math.random() < 0.1
          const isFailed = Math.random() < 0.05

          if (isFailed) {
            tab.status = 'failed'
            tab.error = 'Failed to process bookmark'
            j.failed++
          } else if (isDuplicate && j.prefs.duplicateHandling === 'skip') {
            tab.status = 'duplicate'
            j.duplicates++
          } else {
            tab.status = 'saved'
            j.saved++
          }
          j.processed++
        })
      }
      await updateTab(job.id, (j) => {
        j.status = 'completed'
      })
    })()

    return NextResponse.json({ jobId: job.id })
  } catch (error) {
    console.error('Tab capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
<<<<<<< Current (Your changes)
  return NextResponse.json({ message: 'Tab capture API endpoint' });
=======
  return NextResponse.json({ message: 'Tab capture API endpoint' })
>>>>>>> Incoming (Background Agent changes)
} 