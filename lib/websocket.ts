/**
 * WebSocket utility functions for connecting to dynamic AI chat servers
 * Supports both local and OpenAI providers with automatic URL resolution
 */

/**
 * Connects to the correct WebSocket server based on the configured provider
 * Automatically detects the correct protocol (ws/wss) and fetches the server URL from API
 *
 * @returns Promise<WebSocket> - Connected WebSocket instance
 * @throws Error if connection fails
 */
export async function connectToCorrectWebSocket(): Promise<WebSocket> {
  try {
    // Fetch WebSocket configuration from our API endpoint
    const res = await fetch('/api/ws-url');
    const data = await res.json();

    // Use the full URL if provided (for external servers like 192.168.1.99:7200)
    // Otherwise build it dynamically for local connections
    const wsUrl =
      data.full_ws_url ||
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}${data.ws_url}`;

    console.log('🔌 Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    // Connection opened successfully
    ws.onopen = () => {
      console.log('✅ WebSocket connected to:', wsUrl);
    };

    // Basic message handler (can be overridden)
    ws.onmessage = (event) => {
      console.log('📨 Message from server:', event.data);
    };

    // Error handling
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    // Connection closed
    ws.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.code, event.reason);
    };

    return ws;
  } catch (error) {
    console.error('💥 Failed to connect to WebSocket:', error);
    throw error;
  }
}

/**
 * Helper function to get WebSocket URL without establishing connection
 * Useful for debugging or displaying connection info to users
 *
 * @returns Promise<string> - The WebSocket URL path
 */
export async function getWebSocketUrl(): Promise<string> {
  const res = await fetch('/api/ws-url');
  const data = await res.json();
  return data.ws_url;
}

/**
 * Advanced WebSocket manager class for chat functionality
 * Provides automatic reconnection, message handling, and connection state management
 */
export class ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private onMessageCallback?: (message: unknown) => void;
  private onErrorCallback?: (error: Event) => void;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectBaseDelay = 1000; // 1 second

  /**
   * Establishes WebSocket connection with custom message and error handlers
   * Includes automatic reconnection logic with exponential backoff
   *
   * @param onMessage - Callback function for incoming messages
   * @param onError - Callback function for error handling
   * @returns Promise<WebSocket> - Connected WebSocket instance
   */
  async connect(
    onMessage?: (message: unknown) => void,
    onError?: (error: Event) => void,
  ): Promise<WebSocket> {
    // Store callbacks for reconnection attempts
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;

    try {
      // Use our dynamic connection function
      this.ws = await connectToCorrectWebSocket();

      // Set up custom message handler if provided
      if (this.onMessageCallback) {
        this.ws.onmessage = (event) => {
          try {
            // Try to parse as JSON first
            const data = JSON.parse(event.data as string);
            this.onMessageCallback!(data);
          } catch {
            // If not JSON, pass raw data
            this.onMessageCallback!(event.data);
          }
        };
      }

      // Set up custom error handler if provided
      if (this.onErrorCallback) {
        this.ws.onerror = this.onErrorCallback;
      }

      // Handle connection close with automatic reconnection
      this.ws.onclose = () => {
        console.log(
          `🔄 Connection lost. Reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`,
        );

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;

          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1);

          console.log(`⏳ Reconnecting in ${delay}ms...`);
          setTimeout(() => {
            this.connect(this.onMessageCallback, this.onErrorCallback);
          }, delay);
        } else {
          console.error('💀 Max reconnection attempts reached. Connection failed permanently.');
        }
      };

      // Reset reconnection counter on successful connection
      this.reconnectAttempts = 0;
      return this.ws;
    } catch (error) {
      console.error('💥 Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  /**
   * Sends a message through the WebSocket connection
   */
  sendMessage(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageString =
        typeof message === 'string' ? message : JSON.stringify(message as Record<string, unknown>);
      console.log('\ud83d\udce4 Sending message:', messageString);
      this.ws.send(messageString);
    } else {
      console.error('\u274c Cannot send message: WebSocket is not connected');
      console.log('\ud83d\udd0d Current WebSocket state:', this.ws?.readyState || 'null');
    }
  }

  /**
   * Gracefully closes the WebSocket connection
   * Prevents automatic reconnection
   */
  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Manually disconnecting WebSocket...');

      // Prevent reconnection by maxing out attempts
      this.reconnectAttempts = this.maxReconnectAttempts;

      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Checks if the WebSocket is currently connected and ready to send messages
   *
   * @returns boolean - True if connected and ready
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Gets the current connection state as a readable string
   *
   * @returns string - Human-readable connection state
   */
  getConnectionState(): string {
    if (!this.ws) return 'Disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'Connecting';
      case WebSocket.OPEN:
        return 'Connected';
      case WebSocket.CLOSING:
        return 'Closing';
      case WebSocket.CLOSED:
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  /**
   * Gets current reconnection status
   *
   * @returns object with reconnection info
   */
  getReconnectionInfo(): { attempts: number; maxAttempts: number; canReconnect: boolean } {
    return {
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      canReconnect: this.reconnectAttempts < this.maxReconnectAttempts,
    };
  }
}
