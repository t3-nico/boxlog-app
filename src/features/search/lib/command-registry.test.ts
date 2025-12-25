import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Command } from '../types';

import { commandRegistry } from './command-registry';

describe('commandRegistry', () => {
  beforeEach(() => {
    // テスト前にレジストリをクリア
    commandRegistry.clear();
  });

  describe('register', () => {
    it('コマンドを登録できる', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
      };

      commandRegistry.register(command);

      expect(commandRegistry.get('test:command')).toBe(command);
    });

    it('カテゴリーが自動的に追加される', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'new-category',
        action: vi.fn(),
      };

      commandRegistry.register(command);

      expect(commandRegistry.getCategories()).toContain('new-category');
    });
  });

  describe('registerMany', () => {
    it('複数のコマンドを一度に登録できる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'test', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'test', action: vi.fn() },
        { id: 'cmd3', title: 'コマンド3', category: 'other', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      expect(commandRegistry.get('cmd1')).toBeDefined();
      expect(commandRegistry.get('cmd2')).toBeDefined();
      expect(commandRegistry.get('cmd3')).toBeDefined();
    });
  });

  describe('unregister', () => {
    it('コマンドを登録解除できる', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
      };

      commandRegistry.register(command);
      commandRegistry.unregister('test:command');

      expect(commandRegistry.get('test:command')).toBeUndefined();
    });

    it('存在しないコマンドの登録解除はエラーにならない', () => {
      expect(() => commandRegistry.unregister('non-existent')).not.toThrow();
    });
  });

  describe('get', () => {
    it('登録されたコマンドを取得できる', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
      };

      commandRegistry.register(command);

      expect(commandRegistry.get('test:command')).toBe(command);
    });

    it('存在しないコマンドはundefinedを返す', () => {
      expect(commandRegistry.get('non-existent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('すべてのコマンドを取得できる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'test', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'other', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      const allCommands = commandRegistry.getAll();
      expect(allCommands).toHaveLength(2);
    });

    it('カテゴリーでフィルターできる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'test', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'test', action: vi.fn() },
        { id: 'cmd3', title: 'コマンド3', category: 'other', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      const testCommands = commandRegistry.getAll(['test']);
      expect(testCommands).toHaveLength(2);
      expect(testCommands.every((c) => c.category === 'test')).toBe(true);
    });

    it('複数のカテゴリーでフィルターできる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'cat1', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'cat2', action: vi.fn() },
        { id: 'cmd3', title: 'コマンド3', category: 'cat3', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      const filtered = commandRegistry.getAll(['cat1', 'cat2']);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('getAvailable', () => {
    it('conditionがないコマンドは利用可能', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
      };

      commandRegistry.register(command);

      const available = commandRegistry.getAvailable();
      expect(available).toHaveLength(1);
    });

    it('conditionがtrueを返すコマンドは利用可能', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
        condition: () => true,
      };

      commandRegistry.register(command);

      const available = commandRegistry.getAvailable();
      expect(available).toHaveLength(1);
    });

    it('conditionがfalseを返すコマンドは利用不可', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
        condition: () => false,
      };

      commandRegistry.register(command);

      const available = commandRegistry.getAvailable();
      expect(available).toHaveLength(0);
    });

    it('conditionがエラーを投げるコマンドは利用不可', () => {
      const command: Command = {
        id: 'test:command',
        title: 'テストコマンド',
        category: 'test',
        action: vi.fn(),
        condition: () => {
          throw new Error('condition error');
        },
      };

      commandRegistry.register(command);

      const available = commandRegistry.getAvailable();
      expect(available).toHaveLength(0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      const commands: Command[] = [
        {
          id: 'nav:calendar',
          title: 'カレンダーを開く',
          description: 'カレンダービューを表示',
          category: 'navigation',
          keywords: ['calendar', 'schedule'],
          action: vi.fn(),
        },
        {
          id: 'nav:inbox',
          title: 'Inboxを開く',
          description: 'タスク一覧を表示',
          category: 'navigation',
          keywords: ['inbox', 'tasks'],
          action: vi.fn(),
        },
        {
          id: 'create:plan',
          title: '新規プラン作成',
          description: '新しいプランを追加',
          category: 'create',
          keywords: ['new', 'add', 'plan'],
          action: vi.fn(),
        },
      ];
      commandRegistry.registerMany(commands);
    });

    it('空のクエリですべての利用可能なコマンドを返す', () => {
      const results = commandRegistry.search('');

      expect(results).toHaveLength(3);
    });

    it('タイトルで検索できる', () => {
      const results = commandRegistry.search('カレンダー');

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('nav:calendar');
    });

    it('説明文で検索できる', () => {
      const results = commandRegistry.search('タスク一覧');

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('nav:inbox');
    });

    it('キーワードで検索できる', () => {
      const results = commandRegistry.search('schedule');

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('nav:calendar');
    });

    it('部分一致で検索できる', () => {
      const results = commandRegistry.search('開く');

      expect(results).toHaveLength(2);
    });

    it('大文字小文字を区別しない', () => {
      const results = commandRegistry.search('CALENDAR');

      expect(results).toHaveLength(1);
    });

    it('タイトルの先頭一致を優先する', () => {
      // 「新規」で始まるコマンドが先に来る
      const results = commandRegistry.search('新規');

      expect(results[0]?.title.startsWith('新規')).toBe(true);
    });

    it('カテゴリーフィルターが適用される', () => {
      const results = commandRegistry.search('', ['navigation']);

      expect(results).toHaveLength(2);
      expect(results.every((c) => c.category === 'navigation')).toBe(true);
    });

    it('検索とカテゴリーフィルターを組み合わせられる', () => {
      const results = commandRegistry.search('開く', ['navigation']);

      expect(results).toHaveLength(2);
    });
  });

  describe('getCategories', () => {
    it('登録されたカテゴリーを取得できる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'cat1', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'cat2', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      const categories = commandRegistry.getCategories();
      expect(categories).toContain('cat1');
      expect(categories).toContain('cat2');
    });

    it('重複したカテゴリーは1つにまとめられる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'test', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'test', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);

      const categories = commandRegistry.getCategories();
      expect(categories.filter((c) => c === 'test')).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('すべてのコマンドをクリアできる', () => {
      const commands: Command[] = [
        { id: 'cmd1', title: 'コマンド1', category: 'test', action: vi.fn() },
        { id: 'cmd2', title: 'コマンド2', category: 'test', action: vi.fn() },
      ];

      commandRegistry.registerMany(commands);
      commandRegistry.clear();

      expect(commandRegistry.getAll()).toHaveLength(0);
      expect(commandRegistry.getCategories()).toHaveLength(0);
    });
  });
});
