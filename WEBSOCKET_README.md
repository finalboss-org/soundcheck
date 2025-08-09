# WebSocket Implementation

This document describes the basic WebSocket implementation added to the Soundcheck application.

## Overview

A basic WebSocket connection has been established between the client and server. When a chat completion request is made to `/api/chat/completions`, the server sends a "hello world" message to all connected WebSocket clients.

## Architecture

### Server Side

- **WebSocket Server**: Located in `lib/websocket-server.ts`
  - Runs on port 3001
  - Handles client connections and message broadcasting
  - Provides `getWebSocketServer()` and `broadcastToClients()` functions

- **Chat Completions Integration**: Updated `app/api/chat/completions/route.ts`
  - Initializes WebSocket server on first request
  - Broadcasts "hello world" message when chat completion is triggered
  - Maintains existing bullshit detection functionality

- **WebSocket API**: `app/api/websocket/init/route.ts`
  - GET/POST endpoints to check and initialize WebSocket server
  - Returns server status and connected client count

### Client Side

- **WebSocket Hook**: `hooks/useWebSocket.ts`
  - React hook for managing WebSocket connections
  - Handles connection, reconnection, and message handling
  - Provides connection status and message sending capabilities

- **UI Integration**: Updated `app/page.tsx`
  - Uses WebSocket hook to connect to server
  - Displays WebSocket connection status
  - Shows received messages in transcription area
  - Includes test button to trigger chat completions

## Usage

1. **Install Dependencies**: 
   ```bash
   npm install ws @types/ws
   ```

2. **Start the Application**:
   ```bash
   npm run dev
   ```

3. **Test the WebSocket**:
   - Open the application in browser
   - Check WebSocket connection status (should show 🟢 Connected)
   - Click "Test WebSocket (Trigger Chat Completion)" button
   - The transcription area should show "[WebSocket] hello world"

## WebSocket Message Format

Messages sent over WebSocket follow this structure:

```javascript
{
  type: 'chat_completion_triggered',
  message: 'hello world',
  timestamp: '2025-01-01T12:00:00.000Z',
  completionId: 'uuid-string'
}
```

## Message Types

- `connected`: Initial connection established
- `chat_completion_triggered`: Sent when chat completion API is called
- `echo`: Server echo response (for testing)

## Troubleshooting

- **WebSocket won't connect**: Ensure the server is running and port 3001 is available
- **Messages not appearing**: Check browser console for WebSocket errors
- **TypeScript errors**: Ensure `@types/ws` is installed

## Future Enhancements

- Add authentication for WebSocket connections
- Implement message queuing for offline clients
- Add more message types for different events
- Consider using Socket.IO for additional features