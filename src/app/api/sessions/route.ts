// src/app/api/sessions/route.ts
// API route for anonymous session logging (for balance analytics)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const SessionInputSchema = z.object({
  mode: z.enum(['normal', 'chaos', 'free']),
  durationSec: z.number().int().min(0),
  ticketsCompleted: z.number().int().min(0),
  finalScore: z.number().int().min(0),
  errors: z.number().int().min(0),
  gringoEncounters: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SessionInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const session = await db.sessionLog.create({ data })

    return NextResponse.json({ ok: true, id: session.id })
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    return NextResponse.json(
      { error: 'Failed to create session log' },
      { status: 500 }
    )
  }
}
