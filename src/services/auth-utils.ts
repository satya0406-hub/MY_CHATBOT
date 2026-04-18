import { GenerateContentResponse } from "@google/generative-ai";

const CLIENT_ID = (import.meta as any).env.VITE_CLIENT_ID;
// Use a more robust way to determine the redirect URL that works with subdirectories (like GitHub Pages)
const getRedirectUrl = () => {
  const baseUrl = (import.meta as any).env.BASE_URL || '/';
  const url = new URL(baseUrl + 'oauth-redirect.html', window.location.origin);
  return url.href.replace(/([^:]\/)\/+/g, "$1"); // Clean up double slashes
};
const OAUTH_URL = getRedirectUrl();
const SCOPE = 'https://www.googleapis.com/auth/generative-language.peruserquota';
const AUTH_POPUP_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${OAUTH_URL}&response_type=token&scope=${SCOPE}`;
const SIGNIN_TIMEOUT = 30000; // 30 seconds

/**
 * Opens a popup for Google OAuth and returns a promise that resolves with the
 * access token. Rejects if the user doesn't sign in within the timeout period.
 */
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authWindow = window.open(AUTH_POPUP_URL, 'google-signin', 'width=600,height=700');

    let timeoutId: number | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('message', handleAuthMessage);
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data && event.data.type === 'oauth_success' && event.data.response.access_token) {
        cleanup();
        resolve(event.data.response.access_token);
      }
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Sign-in timed out. Please try again.'));
    }, SIGNIN_TIMEOUT);

    window.addEventListener('message', handleAuthMessage);
  });
};

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class GlobalQuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GlobalQuotaExceededError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
* Calls the Gemini API using the per-user quota endpoint.
* @param accessToken The user's OAuth access token.
* @param request The model and contents for the request
* @param additionalConfig Additional configuration options to pass as part of the body of the request
* @return The JSON response from the API.
*/
export const generateContent = async (accessToken: string, request: { model: string, contents: any }, additionalConfig?: any): Promise<GenerateContentResponse> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContentPerUserQuota?access_token=${accessToken}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...additionalConfig, contents: request.contents }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);

    if (response.status === 401) {
      throw new UnauthorizedError('Your session has expired. Please reconnect.');
    }

    if (response.status === 429 || errorData.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new QuotaExceededError(errorData.error?.message || 'Quota exceeded. Please upgrade.');
    }

    throw new Error(errorData.error?.message || 'Failed to get a response from the API.');
  }

  return response.json();
};

/**
 * Calls the Gemini API using the per-user quota streaming endpoint.
 */
export async function* streamGenerateContent(accessToken: string, request: { model: string, contents: any }, additionalConfig?: any) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:streamGenerateContentPerUserQuota?alt=sse&access_token=${accessToken}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...additionalConfig, contents: request.contents }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new UnauthorizedError('Your session has expired. Please reconnect.');
    }

    if (response.status === 429 || errorData.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new QuotaExceededError(errorData.error?.message || 'Quota exceeded. Please upgrade.');
    }
    throw new Error(errorData.error?.message || 'Failed to get a response from the API.');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Failed to get response reader");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace("data: ", "");
        try {
          const data = JSON.parse(jsonStr);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch (e) {
          console.error("Error parsing SSE chunk:", e);
        }
      }
    }
  }
}
