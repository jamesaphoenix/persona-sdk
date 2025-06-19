import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const MANIFEST_PATH = path.join(process.cwd(), 'test-manifest.json')

export async function GET() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    // Return empty manifest if none exists
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      testedFunctions: {},
      coverage: {
        total: 0,
        tested: 0,
        percentage: 0,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const manifest = await request.json()
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save manifest' },
      { status: 500 }
    )
  }
}