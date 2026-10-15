// src/app/api/scores/route.ts
// API routes for leaderboard scores

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const ScoreInputSchema = z.object({
  initials: z.string().length(3).regex(/^[A-Z0-9]+$/i, 'Initials must be alphanumeric 3 chars'),
  score: z.number().int().min(0),
  tickets: z.number().int().min(0),
  maxCombo: z.number().int().min(0),
  mode: z.enum(['normal', 'chaos', 'free']),
  durationSec: z.number().int().min(0),
  gringoEncounters: z.number().int().min(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') ?? 'normal'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50)

    const scores = await db.score.findMany({
      where: { mode },
      orderBy: { score: 'desc' },
      take: limit,
      select: {
        id: true,
        initials: true,
        score: true,
        tickets: true,
        maxCombo: true,
        mode: true,
        durationSec: true,
        gringoEncounters: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ scores, count: scores.length })
  } catch (err) {
    console.error('GET /api/scores error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ScoreInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const normalizedInitials = data.initials.toUpperCase()

    // Create the score
    const score = await db.score.create({
      data: {
        initials: normalizedInitials,
        score: data.score,
        tickets: data.tickets,
        maxCombo: data.maxCombo,
        mode: data.mode,
        durationSec: data.durationSec,
        gringoEncounters: data.gringoEncounters,
      },
    })

    // Compute rank: count scores with higher score in same mode
    const higherCount = await db.score.count({
      where: {
        mode: data.mode,
        score: { gt: data.score },
      },
    })
    const rank = higherCount + 1

    return NextResponse.json({ ok: true, id: score.id, rank })
  } catch (err) {
    console.error('POST /api/scores error:', err)
    return NextResponse.json(
      { error: 'Failed to create score' },
      { status: 500 }
    )
  }
}
