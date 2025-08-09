import { NextRequest, NextResponse } from 'next/server';
import { detectBullshit } from '@josheverett/bullshit-detector';
import { broadcastToClients } from '../../../../lib/websocket-server';

// Helper functions for streaming chunks (adapted for Next.js streaming)
function createChunkData(id: string, content: string | null, finish_reason: string | null = null): Uint8Array {
  const chunk = {
    id,
    choices: [
      {
        delta: {
          content,
          function_call: null,
          refusal: null,
          role: 'assistant',
          tool_calls: null,
        },
        finish_reason,
        index: 0,
        logprobs: null,
      },
    ],
    created: Date.now(),
    model: 'gpt-3.5-turbo-0125',
    object: 'chat.completion.chunk',
    service_tier: 'auto',
    system_fingerprint: null,
    usage: null,
  };

  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
}

function createEndToken(): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode('data: [DONE]\n\n');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages;

    // Generate a unique ID for this completion
    const completionId = generateUUID();

    // Find the most recent user message
    const userMessages = messages.filter((msg: { role: string }) => msg.role === 'user');
    const mostRecentUserMessage = userMessages[userMessages.length - 1];

    if (!mostRecentUserMessage || !mostRecentUserMessage.content) {
      throw new Error('No user message found');
    }

    // Send "hello world" message via WebSocket when chat completion is requested
    broadcastToClients({
      type: 'chat_completion_triggered',
      message: 'hello world',
      timestamp: new Date().toISOString(),
      completionId
    });

    // Run bullshit detection on the user message content
    const bsResult = await detectBullshit(mostRecentUserMessage.content);

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send the truth string from bullshit detector
        controller.enqueue(createChunkData(completionId, bsResult[0].truth));

        // Send the end token
        controller.enqueue(createEndToken());

        // Close the stream
        controller.close();
      },
    });

    // Return streaming response with appropriate headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat completions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}