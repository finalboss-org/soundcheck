import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

// Global WebSocket server instance - using globalThis to persist across hot reloads
declare global {
  var __websocketServer: WebSocketServer | undefined;
}

export function getWebSocketServer(): WebSocketServer {
  // Check if server already exists in global scope (for hot reload persistence)
  if (globalThis.__websocketServer) {
    return globalThis.__websocketServer;
  }

  try {
    // Create WebSocket server that can be attached to existing HTTP server
    const wss = new WebSocketServer({
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

    wss.on('error', (error: Error & { code?: string }) => {
      if (error.code === 'EADDRINUSE') {
        console.log('WebSocket server port 3001 already in use - this is expected during development');
        return;
      }
      console.error('WebSocket server error:', error);
    });

    // Store in global scope for hot reload persistence
    globalThis.__websocketServer = wss;

    console.log('WebSocket server started on port 3001');
    return wss;

  } catch (error: Error & { code?: string }) {
    if (error.code === 'EADDRINUSE') {
      console.log('WebSocket server port 3001 already in use - reusing existing server');
      // If we can't create a new server, assume one exists and try to find it
      // In development, this might happen due to hot reloading
      if (globalThis.__websocketServer) {
        return globalThis.__websocketServer;
      }
      // If we still don't have a reference, create a dummy server object
      // This isn't ideal but prevents crashes
      throw new Error('WebSocket server port in use but no global reference found');
    }
    throw error;
  }
}

// Function to broadcast message to all connected clients
export function broadcastToClients(message: unknown) {
  try {
    const wsServer = getWebSocketServer();

    if (!wsServer || !wsServer.clients) {
      console.warn('WebSocket server not available for broadcasting');
      return;
    }

    wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error sending message to WebSocket client:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error broadcasting to WebSocket clients:', error);
  }
}