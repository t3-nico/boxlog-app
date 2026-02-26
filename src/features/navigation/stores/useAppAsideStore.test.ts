import { beforeEach, describe, expect, it } from 'vitest';

import { useAppAsideStore } from '@/stores/useAppAsideStore';

describe('useAppAsideStore', () => {
  beforeEach(() => {
    useAppAsideStore.setState({ asideType: 'none', asideSize: 28 });
  });

  describe('初期状態', () => {
    it('asideTypeがnone', () => {
      expect(useAppAsideStore.getState().asideType).toBe('none');
    });

    it('asideSizeがデフォルト28%', () => {
      expect(useAppAsideStore.getState().asideSize).toBe(28);
    });
  });

  describe('setAside', () => {
    it('asideTypeを設定できる', () => {
      useAppAsideStore.getState().setAside('plan');
      expect(useAppAsideStore.getState().asideType).toBe('plan');
    });

    it('noneに戻せる', () => {
      useAppAsideStore.getState().setAside('record');
      useAppAsideStore.getState().setAside('none');
      expect(useAppAsideStore.getState().asideType).toBe('none');
    });
  });

  describe('openAside', () => {
    it('アサイドを開ける', () => {
      useAppAsideStore.getState().openAside('chat');
      expect(useAppAsideStore.getState().asideType).toBe('chat');
    });
  });

  describe('closeAside', () => {
    it('アサイドを閉じる', () => {
      useAppAsideStore.getState().openAside('plan');
      useAppAsideStore.getState().closeAside();
      expect(useAppAsideStore.getState().asideType).toBe('none');
    });
  });

  describe('setAsideSize', () => {
    it('アサイド幅を更新できる', () => {
      useAppAsideStore.getState().setAsideSize(35);
      expect(useAppAsideStore.getState().asideSize).toBe(35);
    });
  });
});
