'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface WebSocketMessage {
  type: string;
  message: string;
  timestamp?: string;
  completionId?: string;
  userMessage?: string;
  bullshitDetection?: Array<{
    transcript?: string;
    claim?: string;
    summary?: string;
    bullshitLevel?: number;  // 0-5 scale (0 = no bullshit, 5 = maximum bullshit)
    confidence?: number;     // 0-5 scale confidence in the evaluation
    reasoning?: string;
    truth?: string;
    [key: string]: any;
  }>;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  // Auto-detect WebSocket URL based on environment
  const getWebSocketUrl = () => {
    if (url) return url;

    // In browser environment
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = window.location.port;

      // In development, use separate WebSocket port
      if (process.env.NODE_ENV === 'development') {
        return `${protocol}//${host}:3001`;
      }

      // In production, use same port as main app
      return `${protocol}//${host}${port ? `:${port}` : ''}`;
    }

    // Fallback for SSR
    return 'ws://localhost:3001';
  };

  const wsUrl = getWebSocketUrl();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      console.log('Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Initialize Vapi after successful websocket connection
        try {
          const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
          const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

          if (vapiToken && vapiAssistantId) {
            const vapiInstance = new Vapi(vapiToken);
            const response = await vapiInstance.start(vapiAssistantId);
            console.log('Vapi response:', response);
          } else {
            console.warn('Vapi credentials not found. Please set NEXT_PUBLIC_VAPI_WEB_TOKEN and NEXT_PUBLIC_VAPI_ASSISTANT_ID environment variables.');
          }
        } catch (error) {
          console.error('Error initializing Vapi:', error);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [wsUrl]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  useEffect(() => {
    // Add a small delay to allow server initialization to complete
    const connectTimeout = setTimeout(() => {
      connect();
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(connectTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect
  };
}