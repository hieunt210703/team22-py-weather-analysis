import { afterEach, describe, expect, it, vi } from 'vitest'

import { requestJson } from './client'

describe('requestJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('trả về dữ liệu JSON khi request thành công', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ username: 'admin' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(requestJson('/api/auth/me')).resolves.toEqual({
      username: 'admin',
    })
  })

  it('ném ApiError với thông báo của API khi nhận lỗi 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Bạn cần đăng nhập' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const request = requestJson('/api/auth/me')

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Bạn cần đăng nhập',
      status: 401,
    })
  })

  it('dùng thông báo chung khi detail không phải chuỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: [{ type: 'missing' }] }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(requestJson('/api/auth/login')).rejects.toMatchObject({
      message: 'Có lỗi xảy ra, vui lòng thử lại',
      status: 422,
    })
  })

  it('không đặt JSON Content-Type khi body là FormData', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ importedCount: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const body = new FormData()
    body.append('file', new Blob(['data']), 'locations.csv')

    await requestJson('/api/admin/locations/import', {
      method: 'POST',
      body,
    })

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit
    expect(new Headers(requestOptions.headers).has('Content-Type')).toBe(false)
  })
})
