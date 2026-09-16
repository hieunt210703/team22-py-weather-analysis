const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getErrorMessage(body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    typeof body.detail === 'string'
  ) {
    return body.detail
  }
  return DEFAULT_ERROR_MESSAGE
}

export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const response = await fetch(path, { ...options, headers })
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    throw new ApiError(response.status, getErrorMessage(body))
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
