/**
 * Tag Service Unit Tests
 *
 * TagServiceのビジネスロジックをモックを使用してテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabase } from '@/test/trpc-test-helpers';

import { createTagService, TagService, TagServiceError } from '../tag-service';

describe('TagService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let service: TagService;
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    service = createTagService(mockSupabase as Parameters<typeof createTagService>[0]);
  });

  describe('list', () => {
    it('should return tags for user', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'Tag 1', user_id: userId },
        { id: 'tag-2', name: 'Tag 2', user_id: userId },
      ];

      setupMockQuery(mockSupabase.from, mockTags);

      const result = await service.list({ userId });

      expect(result).toEqual(mockTags);
      expect(mockSupabase.from).toHaveBeenCalledWith('tags');
    });

    it('should apply default sort (name, asc)', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId });

      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should apply custom sort', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, sortField: 'created_at', sortOrder: 'desc' });

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should throw TagServiceError on fetch failure', async () => {
      setupMockQueryError(mockSupabase.from, 'Database connection failed');

      await expect(service.list({ userId })).rejects.toThrow(TagServiceError);
      await expect(service.list({ userId })).rejects.toThrow('Failed to fetch tags');
    });
  });

  describe('getById', () => {
    it('should return tag by id', async () => {
      const mockTag = { id: 'tag-1', name: 'Tag 1', user_id: userId };

      setupMockSingleQuery(mockSupabase.from, mockTag);

      const result = await service.getById({ userId, tagId: 'tag-1' });

      expect(result).toEqual(mockTag);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(service.getById({ userId, tagId: 'non-existent' })).rejects.toThrow(
        TagServiceError,
      );

      try {
        await service.getById({ userId, tagId: 'non-existent' });
      } catch (error) {
        expect((error as TagServiceError).code).toBe('NOT_FOUND');
      }
    });
  });

  describe('create', () => {
    it('should create a new tag with defaults', async () => {
      const mockTag = {
        id: 'new-tag-id',
        name: 'New Tag',
        color: '#3B82F6',
        user_id: userId,
      };

      setupMockInsertQuery(mockSupabase.from, mockTag);

      const result = await service.create({
        userId,
        input: { name: 'New Tag' },
      });

      expect(result).toEqual(mockTag);
    });

    it('should create a tag with custom color', async () => {
      const mockTag = {
        id: 'new-tag-id',
        name: 'New Tag',
        color: '#FF0000',
        user_id: userId,
      };

      setupMockInsertQuery(mockSupabase.from, mockTag);

      const result = await service.create({
        userId,
        input: { name: 'New Tag', color: '#FF0000' },
      });

      expect(result.color).toBe('#FF0000');
    });

    it('should trim tag name', async () => {
      const mockTag = {
        id: 'new-tag-id',
        name: 'Trimmed Name',
        user_id: userId,
      };

      const mockQuery = setupMockInsertQuery(mockSupabase.from, mockTag);

      await service.create({
        userId,
        input: { name: '  Trimmed Name  ' },
      });

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Trimmed Name' }),
      );
    });

    it('should throw INVALID_INPUT for empty name', async () => {
      await expect(
        service.create({
          userId,
          input: { name: '' },
        }),
      ).rejects.toThrow(TagServiceError);

      try {
        await service.create({ userId, input: { name: '' } });
      } catch (error) {
        expect((error as TagServiceError).code).toBe('INVALID_INPUT');
      }
    });

    it('should throw INVALID_INPUT for whitespace-only name', async () => {
      await expect(
        service.create({
          userId,
          input: { name: '   ' },
        }),
      ).rejects.toThrow(TagServiceError);
    });

    it('should throw INVALID_INPUT for name exceeding 50 characters', async () => {
      const longName = 'a'.repeat(51);

      await expect(
        service.create({
          userId,
          input: { name: longName },
        }),
      ).rejects.toThrow(TagServiceError);

      try {
        await service.create({ userId, input: { name: longName } });
      } catch (error) {
        expect((error as TagServiceError).code).toBe('INVALID_INPUT');
        expect((error as TagServiceError).message).toContain('50 characters');
      }
    });

    it('should throw DUPLICATE_NAME for duplicate tag name', async () => {
      setupMockInsertError(mockSupabase.from, '23505', 'Duplicate key');

      await expect(
        service.create({
          userId,
          input: { name: 'Duplicate' },
        }),
      ).rejects.toThrow(TagServiceError);

      try {
        await service.create({ userId, input: { name: 'Duplicate' } });
      } catch (error) {
        expect((error as TagServiceError).code).toBe('DUPLICATE_NAME');
      }
    });
  });

  describe('update', () => {
    const existingTag = {
      id: 'tag-1',
      name: 'Original',
      color: '#000000',
      user_id: userId,
    };

    it('should update tag name', async () => {
      const updatedTag = { ...existingTag, name: 'Updated' };

      setupMockUpdateQuery(mockSupabase.from, existingTag, updatedTag);

      const result = await service.update({
        userId,
        tagId: 'tag-1',
        updates: { name: 'Updated' },
      });

      expect(result.name).toBe('Updated');
    });

    it('should update tag color', async () => {
      const updatedTag = { ...existingTag, color: '#FF0000' };

      setupMockUpdateQuery(mockSupabase.from, existingTag, updatedTag);

      const result = await service.update({
        userId,
        tagId: 'tag-1',
        updates: { color: '#FF0000' },
      });

      expect(result.color).toBe('#FF0000');
    });

    it('should throw INVALID_INPUT for empty name update', async () => {
      setupMockSingleQuery(mockSupabase.from, existingTag);

      await expect(
        service.update({
          userId,
          tagId: 'tag-1',
          updates: { name: '' },
        }),
      ).rejects.toThrow(TagServiceError);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(
        service.update({
          userId,
          tagId: 'non-existent',
          updates: { name: 'New Name' },
        }),
      ).rejects.toThrow(TagServiceError);
    });
  });

  describe('delete', () => {
    const existingTag = {
      id: 'tag-1',
      name: 'To Delete',
      user_id: userId,
    };

    it('should delete tag and return deleted tag', async () => {
      setupMockDeleteQuery(mockSupabase.from, existingTag);

      const result = await service.delete({ userId, tagId: 'tag-1' });

      expect(result).toEqual(existingTag);
    });

    it('should throw NOT_FOUND when tag does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(service.delete({ userId, tagId: 'non-existent' })).rejects.toThrow(
        TagServiceError,
      );
    });
  });

  describe('merge', () => {
    it('should throw SAME_TAG_MERGE when source equals target', async () => {
      await expect(
        service.merge({
          userId,
          sourceTagId: 'tag-1',
          targetTagId: 'tag-1',
        }),
      ).rejects.toThrow(TagServiceError);

      try {
        await service.merge({
          userId,
          sourceTagId: 'tag-1',
          targetTagId: 'tag-1',
        });
      } catch (error) {
        expect((error as TagServiceError).code).toBe('SAME_TAG_MERGE');
      }
    });
  });
});

// ヘルパー関数

function createChainableMock(data: unknown, error: { message: string; code?: string } | null = null) {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn().mockImplementation((resolve) =>
      resolve({
        data: Array.isArray(data) ? data : data ? [data] : [],
        error,
      }),
    ),
  };

  Object.keys(mock).forEach((key) => {
    if (!['single', 'maybeSingle', 'then'].includes(key)) {
      mock[key]!.mockReturnValue(mock);
    }
  });

  return mock;
}

function setupMockQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  data: unknown[],
) {
  const mock = createChainableMock(data);
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockQueryError(
  mockFrom: ReturnType<typeof vi.fn>,
  errorMessage: string,
) {
  const mock = createChainableMock(null, { message: errorMessage });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockSingleQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  data: unknown,
) {
  const mock = createChainableMock(data, data ? null : { message: 'Not found', code: 'PGRST116' });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockInsertQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  data: unknown,
) {
  const mock = createChainableMock(data);
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockInsertError(
  mockFrom: ReturnType<typeof vi.fn>,
  code: string,
  message: string,
) {
  const mock = createChainableMock(null, { message, code });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockUpdateQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  existingData: unknown,
  updatedData: unknown,
) {
  let callCount = 0;
  const mock = createChainableMock(existingData);

  // Update single() to return different data based on call count
  mock.single = vi.fn().mockImplementation(() => {
    callCount++;
    return Promise.resolve({
      data: callCount === 1 ? existingData : updatedData,
      error: null,
    });
  });

  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockDeleteQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  existingData: unknown,
) {
  let callCount = 0;

  mockFrom.mockImplementation((table: string) => {
    callCount++;

    if (table === 'plan_tags') {
      return createChainableMock(null);
    }

    const mock = createChainableMock(existingData);
    mock.single = vi.fn().mockResolvedValue({
      data: callCount === 1 ? existingData : null,
      error: null,
    });
    mock.then = vi.fn().mockImplementation((resolve) =>
      resolve({ data: null, error: null }),
    );

    return mock;
  });
}
