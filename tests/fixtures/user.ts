// テスト用のユーザーデータ
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

export const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  name: 'Admin User',
  avatar_url: 'https://example.com/admin-avatar.jpg',
  role: 'admin',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

// タスク関連のフィクスチャ
export const mockTask = {
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  priority: 'medium' as const,
  due_date: new Date('2024-12-31').toISOString(),
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
  user_id: mockUser.id,
}

export const mockCompletedTask = {
  ...mockTask,
  id: 'completed-task-id',
  title: 'Completed Task',
  completed: true,
  completed_at: new Date('2024-01-15').toISOString(),
}

// プロジェクト関連のフィクスチャ
export const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test Project Description',
  color: '#3B82F6',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
  user_id: mockUser.id,
}

// 認証関連のフィクスチャ
export const mockAuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

// API レスポンスのフィクスチャ
export const mockApiResponse = {
  success: <T>(data: T) => ({
    data,
    error: null,
    status: 200,
  }),
  error: (message: string, status = 400) => ({
    data: null,
    error: { message, status },
    status,
  }),
}
