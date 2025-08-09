import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketServer } from '../../../../lib/websocket-server';

export async function POST(request: NextRequest) {
  try {
    // Initialize the WebSocket server
    const wss = getWebSocketServer();
    
    return NextResponse.json({ 
      success: true, 
      message: 'WebSocket server initialized',
      port: 3001,
      clients: wss.clients.size
    });
  } catch (error) {
    console.error('Error initializing WebSocket server:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize WebSocket server',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const wss = getWebSocketServer();
    
    return NextResponse.json({
      success: true,
      status: 'WebSocket server is running',
      port: 3001,
      clients: wss.clients.size
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WebSocket server not initialized' 
      },
      { status: 500 }
    );
  }
}