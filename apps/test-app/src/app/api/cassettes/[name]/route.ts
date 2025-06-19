import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CASSETTES_DIR = path.join(process.cwd(), 'cassettes')

// Ensure cassettes directory exists
async function ensureDir() {
  try {
    await fs.access(CASSETTES_DIR)
  } catch {
    await fs.mkdir(CASSETTES_DIR, { recursive: true })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  await ensureDir()
  
  try {
    const cassettePath = path.join(CASSETTES_DIR, `${params.name}.json`)
    const data = await fs.readFile(cassettePath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json(
      { error: 'Cassette not found' },
      { status: 404 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  await ensureDir()
  
  try {
    const cassette = await request.json()
    const cassettePath = path.join(CASSETTES_DIR, `${params.name}.json`)
    await fs.writeFile(cassettePath, JSON.stringify(cassette, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save cassette' },
      { status: 500 }
    )
  }
}