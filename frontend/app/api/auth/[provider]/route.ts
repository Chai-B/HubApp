import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider
  
  // Map frontend provider names to Auth0 connection names
  const connectionMap: { [key: string]: string } = {
    'google': 'google-oauth2',
    'github': 'github',
    'apple': 'apple'
  }
  
  const connection = connectionMap[provider] || provider
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  return NextResponse.redirect(`${backendUrl}/auth/login?connection=${connection}`)
}
