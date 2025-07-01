import { NextRequest, NextResponse } from 'next/server'
import HealthMCPServer from '@/lib/mcp/health-server'

// Configuration du serveur MCP Health
const healthMCPConfig = {
  brightDataApiKey: process.env.BRIGHT_DATA_API_KEY || '',
  cacheEnabled: true,
  maxCacheAge: 3600000, // 1 heure
  ameliBaseUrl: 'https://www.ameli.fr'
}

// Instance globale du serveur MCP
let healthMCPServer: HealthMCPServer | null = null

function getHealthMCPServer(): HealthMCPServer {
  if (!healthMCPServer) {
    healthMCPServer = new HealthMCPServer(healthMCPConfig)
  }
  return healthMCPServer
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, userContext, action } = body

    if (!query) {
      return NextResponse.json(
        { error: 'La question est requise' },
        { status: 400 }
      )
    }

    const server = getHealthMCPServer()

    switch (action) {
      case 'query':
        const result = await server.processHealthQuery(query, userContext)
        return NextResponse.json({
          success: true,
          data: result
        })

      case 'suggestions':
        const suggestions = await server.getHealthSuggestions(userContext)
        return NextResponse.json({
          success: true,
          data: { suggestions }
        })

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur API MCP:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur interne'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const server = getHealthMCPServer()

    switch (action) {
      case 'suggestions':
        const suggestions = await server.getHealthSuggestions()
        return NextResponse.json({
          success: true,
          data: { suggestions }
        })

      case 'health':
        return NextResponse.json({
          success: true,
          data: {
            status: 'online',
            config: {
              cacheEnabled: healthMCPConfig.cacheEnabled,
              ameliBaseUrl: healthMCPConfig.ameliBaseUrl
            }
          }
        })

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur API MCP GET:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur interne'
    }, { status: 500 })
  }
} 