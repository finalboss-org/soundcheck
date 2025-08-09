import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

// Global WebSocket server instance
let wss: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer {
  if (!wss) {
    // Create WebSocket server that can be attached to existing HTTP server
    wss = new WebSocketServer({ 
      port: 3001, // Use a different port for WebSocket
      clientTracking: true 
    });

    wss.on('connection', (ws, request: IncomingMessage) => {
      console.log('New WebSocket connection established');
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established'
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received WebSocket message:', message);
          
          // Echo the message back for now
          ws.send(JSON.stringify({
            type: 'echo',
            message: `Server received: ${message.content || 'unknown'}`
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('WebSocket server started on port 3001');
  }

  return wss;
}

// Function to broadcast message to all connected clients
export function broadcastToClients(message: any) {
  const wsServer = getWebSocketServer();
  
  wsServer.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
    }
  });
}