import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { POST } from '@/app/api/tags/route'
import { GET, PUT, DELETE } from '@/app/api/tags/[id]/route'

// Mock the server Supabase client
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

describe('/api/tags', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      delete: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      maybeSingle: vi.fn(),
      single: vi.fn(),
    }
    require('@/lib/supabase-server').createServerSupabaseClient.mockReturnValue(mockSupabase)
  })

  describe('POST', () => {
    it('should create a new tag and return 201', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
      mockSupabase.single.mockResolvedValueOnce({ data: { id: '1', name: 'test' }, error: null })

      const response = await request(POST)
        .post('/api/tags')
        .send({ name: 'test' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({ id: '1', name: 'test' })
    })

    it('should return 409 if tag name already exists', async () => {
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { id: '1' }, error: null })

      const response = await request(POST)
        .post('/api/tags')
        .send({ name: 'exists' })

      expect(response.status).toBe(409)
    })

    it('should return 422 if parent tag is too deep', async () => {
      // Mock the parent lookup to simulate a depth of 3
      mockSupabase.maybeSingle
        .mockResolvedValueOnce({ data: { parent_id: 'p2' }, error: null }) // depth 1
        .mockResolvedValueOnce({ data: { parent_id: 'p3' }, error: null }) // depth 2
        .mockResolvedValueOnce({ data: { parent_id: null }, error: null }) // depth 3

      const response = await request(POST)
        .post('/api/tags')
        .send({ name: 'deep-tag', parent_id: 'p1' })

      expect(response.status).toBe(422)
    })
  })

  describe('GET /[id]', () => {
    it('should return a tag and 200', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { id: '1', name: 'test' }, error: null })

      const response = await request(GET).get('/api/tags/1')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ id: '1', name: 'test' })
    })

    it('should return 404 if tag not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

      const response = await request(GET).get('/api/tags/1')

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /[id]', () => {
    it('should update a tag and return 200', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { id: '1', name: 'updated' }, error: null })

      const response = await request(PUT)
        .put('/api/tags/1')
        .send({ name: 'updated' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ id: '1', name: 'updated' })
    })
  })

  describe('DELETE /[id]', () => {
    it('should delete a tag and return 204', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: {}, error: null })

      const response = await request(DELETE).delete('/api/tags/1')

      expect(response.status).toBe(204)
    })
  })
})