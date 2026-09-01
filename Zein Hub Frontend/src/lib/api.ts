export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  } | null;
}

export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public errors?: string[];

  constructor(message: string, statusCode: number, errorCode?: string, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  const config: RequestInit = {
    method: 'GET',
    headers: defaultHeaders,
    credentials: 'include', // Crucial: Automatically includes and receives httpOnly cookies (zh_access_token, zh_refresh_token)
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);
    let result: any = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage =
        result?.message || result?.errors?.[0] || `Request failed with status ${response.status}`;
      throw new ApiError(
        errorMessage,
        response.status,
        result?.errorCode || 'API_ERROR',
        result?.errors || []
      );
    }

    return result as ApiResponse<T>;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'تعذر الاتصال بالخادم، يرجى التأكد من تشغيل الـ Backend والاتصال بالإنترنت.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
