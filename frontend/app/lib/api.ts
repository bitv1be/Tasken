export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LaravelValidationErrors {
  [field: string]: string[];
}

export interface AuthResponse {
  message: string;
  token: string;
  token_type: 'Bearer';
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
  device_name?: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string | null;
}

export interface UpdateTodoData {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface TodoResponse {
  data: Todo;
}

export interface TodoListResponse {
  data: Todo[];
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: LaravelValidationErrors;

  constructor(
    message: string,
    status: number,
    errors: LaravelValidationErrors = {},
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    token,
    headers,
    ...requestOptions
  } = options;

  const response = await fetch(`/api${endpoint}`, {
    ...requestOptions,
    cache: 'no-store',
    headers: {
      Accept: 'application/json',

      ...(requestOptions.body
        ? {
          'Content-Type': 'application/json',
        }
        : {}),

      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),

      ...headers,
    },
  });

  const contentType =
    response.headers.get('content-type') ?? '';

  let responseData: unknown = null;

  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
  }

  if (!response.ok) {
    throw createApiError(responseData, response.status);
  }

  return responseData as T;
}

function createApiError(
  responseData: unknown,
  status: number,
): ApiError {
  if (
    typeof responseData === 'object' &&
    responseData !== null
  ) {
    const data = responseData as {
      message?: unknown;
      errors?: unknown;
    };

    const message =
      typeof data.message === 'string'
        ? data.message
        : 'Request failed.';

    const errors =
      typeof data.errors === 'object' &&
        data.errors !== null
        ? (data.errors as LaravelValidationErrors)
        : {};

    return new ApiError(message, status, errors);
  }

  if (typeof responseData === 'string') {
    return new ApiError(responseData, status);
  }

  return new ApiError('Request failed.', status);
}

export const authApi = {
  signup(data: SignupData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: LoginData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  currentUser(token: string): Promise<UserResponse> {
    return apiRequest<UserResponse>('/auth/user', {
      method: 'GET',
      token,
    });
  },

  logout(token: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      token,
    });
  },

  logoutAll(token: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      '/auth/logout-all',
      {
        method: 'POST',
        token,
      },
    );
  },
};

export const todoApi = {
  list(token: string): Promise<TodoListResponse> {
    return apiRequest<TodoListResponse>('/todos', {
      method: 'GET',
      token,
    });
  },

  create(
    data: CreateTodoData,
    token: string,
  ): Promise<TodoResponse> {
    return apiRequest<TodoResponse>('/todos', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  },

  update(
    todoId: number,
    data: UpdateTodoData,
    token: string,
  ): Promise<TodoResponse> {
    return apiRequest<TodoResponse>(`/todos/${todoId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  },

  delete(todoId: number, token: string): Promise<void> {
    return apiRequest<void>(`/todos/${todoId}`, {
      method: 'DELETE',
      token,
    });
  },
};
