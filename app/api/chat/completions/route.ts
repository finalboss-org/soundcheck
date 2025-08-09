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

    // Run bullshit detection on the user message content
    const bsResult = await detectBullshit(mostRecentUserMessage.content);

    // Debug logging
    // console.log('=== BULLSHIT DETECTION DEBUG ===');
    // console.log('User message:', mostRecentUserMessage.content);
    // console.log('bsResult type:', typeof bsResult);
    // console.log('bsResult:', JSON.stringify(bsResult, null, 2));
    // console.log('bsResult is array:', Array.isArray(bsResult));
    // console.log('bsResult length:', bsResult?.length);
    // console.log('bsResult[0]:', bsResult?.[0]);
    // console.log('bsResult[0].truth:', bsResult?.[0]?.truth);
    // console.log('=== END DEBUG ===');

    // Validate bsResult structure
    if (!bsResult || !Array.isArray(bsResult)) {
      console.error('Invalid bsResult structure:', bsResult);
      throw new Error(`Invalid bullshit detection result: ${JSON.stringify(bsResult)}`);
    }

    // Determine response content based on detection results
    let responseContent: string;
    if (bsResult.length === 0) {
      // No bullshit detected - message appears truthful
      responseContent = "No concerning claims detected. The statement appears to be factual and straightforward.";
      console.log('No bullshit detected - returning positive assessment');
    } else {
      // Bullshit detected - return the truth
      if (!bsResult[0] || typeof bsResult[0].truth !== 'string') {
        console.error('Invalid bsResult[0] structure:', bsResult[0]);
        throw new Error(`Invalid bullshit detection result structure: ${JSON.stringify(bsResult[0])}`);
      }
      responseContent = bsResult[0].truth;
      console.log('Bullshit detected - returning truth correction');
    }

    // Send full bullshit detection results via WebSocket
    broadcastToClients({
      type: 'chat_completion_triggered',
      message: 'Bullshit detection complete',
      timestamp: new Date().toISOString(),
      completionId,
      userMessage: mostRecentUserMessage.content,
      bullshitDetection: bsResult,
      responseContent
    });

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send the response content
        controller.enqueue(createChunkData(completionId, responseContent));

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