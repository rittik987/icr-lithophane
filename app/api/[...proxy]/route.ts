import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('/')
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://icr-backend-production.up.railway.app');

export const runtime = 'nodejs';

async function proxyRequest(request: NextRequest) {
  try {
    // Extract the path after /api/
    const pathname = request.nextUrl.pathname;
    const path = pathname.replace('/api', '');
    const search = request.nextUrl.search;
    
    // Build the target URL
    const targetUrl = `${BACKEND_URL}/api${path}${search}`;
    
    console.log(`[API Proxy] ${request.method} ${pathname} -> ${targetUrl}`);

    // Prepare headers
    const headers = new Headers();
    
    // Forward important headers
    const headersToForward = [
      'content-type',
      'authorization',
      'accept',
      'user-agent',
      'accept-language',
    ];
    
    headersToForward.forEach((key) => {
      const value = request.headers.get(key);
      if (value) {
        headers.set(key, value);
      }
    });

    // Forward cookies from the request to backend
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    // Prepare request body
    let body: BodyInit | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // Read the body as text/JSON
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          const json = await request.json();
          body = JSON.stringify(json);
        } catch {
          body = null;
        }
      } else if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass through as-is
        body = request.body as any;
      } else {
        body = await request.text();
      }
    }

    // Make the request to the backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore - duplex is needed for streaming
      duplex: body ? 'half' : undefined,
    });

    // Prepare response headers
    const responseHeaders = new Headers();
    
    // Forward response headers except host
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        responseHeaders.set(key, value);
      }
    });

    // Forward Set-Cookie headers safely using standard getSetCookie() to prevent date corruption
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      setCookies.forEach((cookie) => {
        responseHeaders.append('set-cookie', cookie);
      });
    } else {
      const fallbackCookie = response.headers.get('set-cookie');
      if (fallbackCookie) {
        responseHeaders.set('set-cookie', fallbackCookie);
      }
    }

    // Get response body
    const responseBody = await response.text();

    console.log(`[API Proxy] Response: ${response.status} ${response.statusText}`);

    // Return the proxied response
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Proxy request failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}
