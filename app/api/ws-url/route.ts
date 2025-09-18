import { NextResponse } from 'next/server';

/**
 * WebSocket URL Configuration API Endpoint
 *
 * This API endpoint provides dynamic WebSocket URLs based on the configured model provider.
 * It supports switching between different AI providers (local, OpenAI, etc.) and external servers.
 *
 * Environment Variables:
 * - MODEL_PROVIDER: Determines which AI provider to use ('local' | 'openai')
 * - WEBSOCKET_HOST: External server host (e.g., 'frontend.avarynx.mywire.org')
 *
 * Returns:
 * - ws_url: Relative WebSocket path
 * - full_ws_url: Complete WebSocket URL with host
 * - host: Server host information
 */

// Configuration object for WebSocket settings
const settings = {
  // AI Model provider - determines which WebSocket endpoint to use
  // Can be 'local' for local AI models or 'openai' for OpenAI integration
  model_provider: process.env.MODEL_PROVIDER || 'local',

  // WebSocket server host - supports external servers
  // Default points to your production server at frontend.avarynx.mywire.org
  server_host: process.env.WEBSOCKET_HOST || 'frontend.avarynx.mywire.org',
};

/**
 * GET /api/ws-url
 *
 * Returns the appropriate WebSocket URL configuration based on the current provider settings.
 * This endpoint is called by the frontend to determine which WebSocket to connect to.
 *
 * @returns NextResponse with WebSocket configuration object
 */
export async function GET() {
  let wsPath: string;

  // Determine WebSocket endpoint based on configured provider
  switch (settings.model_provider) {
    case 'local':
      // Local AI models endpoint - connects to your Python server
      wsPath = '/api/chat/ws-models_api';
      break;

    case 'openai':
      // OpenAI integration endpoint - for OpenAI-powered conversations
      wsPath = '/api/chat/ws-openai';
      break;

    default:
      // Fallback to local provider if invalid configuration
      console.warn(`Unknown model provider: ${settings.model_provider}. Falling back to 'local'.`);
      wsPath = '/api/chat/ws-models_api';
  }

  // Construct the complete WebSocket URL
  // Uses 'wss://' protocol for HTTPS and 'ws://' for HTTP
  const protocol = settings.server_host.includes('avarynx.mywire.org') ? 'wss://' : 'ws://';
  const fullUrl = `${protocol}${settings.server_host}${wsPath}`;

  // Log configuration for debugging
  console.log(`🔧 WebSocket Configuration:
    Provider: ${settings.model_provider}
    Host: ${settings.server_host}
    Path: ${wsPath}
    Full URL: ${fullUrl}`);

  // Return configuration object for frontend consumption
  return NextResponse.json({
    // Relative path - used for dynamic URL construction
    ws_url: wsPath,

    // Complete URL - used for external server connections (like frontend.avarynx.mywire.org)
    full_ws_url: fullUrl,

    // Host information - useful for debugging and display
    host: settings.server_host,

    // Provider information - helps frontend understand which AI is being used
    provider: settings.model_provider,
  });
}
