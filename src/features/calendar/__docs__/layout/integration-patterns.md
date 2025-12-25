# Calendar Integration Patterns

## 🔗 統合パターン設計

このドキュメントでは、Calendar機能と他のシステムコンポーネント（UI、ストア、外部API）との統合パターンを説明します。

---

## 🎯 統合アーキテクチャ概要

### 統合レイヤー

```
┌─────────────────────────────────────────┐
│            External APIs                │ ← サードパーティ統合
├─────────────────────────────────────────┤
│            Application Layer            │ ← CalendarController
├─────────────────────────────────────────┤
│            Domain Services              │ ← Business Logic
├─────────────────────────────────────────┤
│            Data Layer                   │ ← Stores & Persistence
├─────────────────────────────────────────┤
│            Infrastructure               │ ← Utils & Helpers
└─────────────────────────────────────────┘
```

### 統合原則

1. **疎結合** - 各コンポーネント間の依存を最小化
2. **インターフェース駆動** - 明確なContract定義
3. **エラー分離** - 一つの統合失敗が全体に影響しない
4. **拡張性** - 新しい統合の追加が容易

---

## 🎨 UI Framework統合

### shadcn/ui Integration

```typescript
// Calendar専用のUI Component拡張
import { Button } from '@/components/shadcn-ui/button'
import { Dialog } from '@/components/shadcn-ui/dialog'
import { Select } from '@/components/shadcn-ui/select'

// Calendar固有のButton variant
const CalendarButton = styled(Button, {
  variants: {
    calendarType: {
      timeSlot: 'hover:bg-primary/10 text-xs font-mono',
      dateHeader: 'font-semibold text-sm',
      eventAction: 'rounded-full p-1 hover:bg-destructive/10'
    }
  }
})

// 使用例
<CalendarButton variant="ghost" calendarType="timeSlot">
  09:00
</CalendarButton>
```

### kiboUI Integration

```typescript
// 高度なCalendar機能でkiboUIを活用
import { KanbanBoard } from '@/components/kibo-ui/kanban'
import { AIAssistant } from '@/components/kibo-ui/ai'

// Task管理でKanban表示
const TaskKanbanView = () => {
  const { tasks } = useTaskStore()

  const kanbanData = useMemo(() => ({
    columns: [
      { id: 'pending', title: '予定', tasks: tasks.filter(t => t.status === 'pending') },
      { id: 'in_progress', title: '実行中', tasks: tasks.filter(t => t.status === 'in_progress') },
      { id: 'completed', title: '完了', tasks: tasks.filter(t => t.status === 'completed') }
    ]
  }), [tasks])

  return (
    <KanbanBoard
      data={kanbanData}
      onTaskMove={handleTaskStatusChange}
      renderTask={({ task }) => <TaskCard task={task} />}
    />
  )
}

// AI支援機能
const CalendarAIAssistant = () => {
  const { events } = useEventStore()

  return (
    <AIAssistant
      context={{
        events: events.slice(0, 10), // 最新10件
        userPreferences: useCalendarSettingsStore.getState()
      }}
      capabilities={[
        'schedule_optimization',
        'conflict_detection',
        'time_recommendation'
      ]}
      onSuggestion={handleAISuggestion}
    />
  )
}
```

### Tailwind CSS系统との統合

```typescript
// Calendar専用のTailwind Config拡張
module.exports = {
  theme: {
    extend: {
      spacing: {
        'hour': '72px',      // 1時間の標準高さ
        'time-col': '64px',  // 時間軸の幅
      },
      colors: {
        calendar: {
          'event-primary': 'hsl(var(--calendar-event-primary))',
          'event-secondary': 'hsl(var(--calendar-event-secondary))',
          'time-line': 'hsl(var(--calendar-time-line))',
          'grid-line': 'hsl(var(--calendar-grid-line))',
        }
      },
      animation: {
        'slide-in-view': 'slideInView 0.3s ease-out',
        'fade-in-event': 'fadeInEvent 0.2s ease-in-out',
      },
      gridTemplateColumns: {
        'calendar-day': '64px 1fr',
        'calendar-week': '64px repeat(7, 1fr)',
        'calendar-agenda': '80px 1fr auto',
      }
    }
  }
}

// CSS Variables for Calendar theming
:root {
  --calendar-event-primary: 220 91% 58%;
  --calendar-event-secondary: 262 52% 65%;
  --calendar-time-line: 0 100% 50%;
  --calendar-grid-line: 220 13% 91%;
}
```

---

## 🗄️ State Management統合

### Zustand Store Pattern

```typescript
// Calendar Stores の統合パターン
interface CalendarStoreSlice {
  // State
  state: CalendarState;

  // Actions
  actions: CalendarActions;

  // Selectors (computed values)
  selectors: CalendarSelectors;

  // Middleware hooks
  middleware: CalendarMiddleware;
}

// Store composition
const useCalendarStore = create<CalendarStoreSlice>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Core state
          events: [],
          tasks: [],
          settings: defaultSettings,

          // Actions with Immer
          addEvent: (event) =>
            set((state) => {
              state.events.push(event);
            }),

          // Computed selectors
          getEventsForDate: (date) => {
            return get().events.filter((event) => isSameDay(event.startDate, date));
          },

          // Middleware
          onEventChange: (callback) => {
            return get().subscribe((state) => state.events, callback, { equalityFn: shallow });
          },
        })),
      ),
      {
        name: 'calendar-store',
        partialize: (state) => ({
          settings: state.settings,
        }), // 設定のみ永続化
      },
    ),
    { name: 'calendar' },
  ),
);
```

### React Query統合 (API状態管理)

```typescript
// API データの管理
const useEvents = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['events', dateRange.start, dateRange.end],
    queryFn: () => fetchEvents(dateRange),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // Zustand storeに同期
      useEventStore.getState().setEvents(data);
    },
  });
};

// Mutation with optimistic updates
const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onMutate: async (newEvent) => {
      // 楽観的更新
      await queryClient.cancelQueries(['events']);

      const previousEvents = queryClient.getQueryData(['events']);
      queryClient.setQueryData(['events'], (old) => [...old, newEvent]);

      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // エラー時はロールバック
      queryClient.setQueryData(['events'], context.previousEvents);
    },
    onSettled: () => {
      // 成功・失敗問わず再取得
      queryClient.invalidateQueries(['events']);
    },
  });
};
```

### Store間通信パターン

```typescript
// Store間の依存関係管理
interface StoreSubscription {
  subscribe: (selector: StateSelector, callback: StateCallback) => Unsubscribe;
}

// EventStore → TaskStore 連携例
const setupStoreIntegration = () => {
  // EventStoreの変更をTaskStoreに反映
  useEventStore.subscribe(
    (state) => state.events,
    (events) => {
      const taskStore = useTaskStore.getState();

      // イベントに関連するタスクを更新
      const relatedTasks = taskStore.tasks.filter((task) =>
        events.some((event) => task.eventId === event.id),
      );

      relatedTasks.forEach((task) => {
        taskStore.updateTaskFromEvent(
          task.id,
          events.find((e) => e.id === task.eventId),
        );
      });
    },
  );

  // SettingsStore → 全Store 設定変更の波及
  useCalendarSettingsStore.subscribe(
    (state) => state.timezone,
    (newTimezone) => {
      // 全イベントのタイムゾーン変換
      useEventStore.getState().convertTimezone(newTimezone);
      useTaskStore.getState().convertTimezone(newTimezone);
    },
  );
};
```

---

## 🌐 External API統合

### Google Calendar API

```typescript
// Google Calendar 統合サービス
class GoogleCalendarIntegration {
  private gapi: GoogleAPI;

  async syncEvents(dateRange: DateRange): Promise<Event[]> {
    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: dateRange.start.toISOString(),
        timeMax: dateRange.end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      // Google Events → Internal Event format
      return response.result.items.map(this.transformGoogleEvent);
    } catch (error) {
      throw new CalendarIntegrationError('Google Calendar sync failed', error);
    }
  }

  private transformGoogleEvent(gEvent: GoogleEvent): Event {
    return {
      id: gEvent.id,
      title: gEvent.summary,
      startDate: new Date(gEvent.start.dateTime || gEvent.start.date),
      endDate: new Date(gEvent.end.dateTime || gEvent.end.date),
      description: gEvent.description,
      location: gEvent.location,
      isAllDay: !gEvent.start.dateTime,
      source: 'google',
      externalId: gEvent.id,
    };
  }

  async createEvent(event: Event): Promise<Event> {
    const gEvent = this.transformToGoogleEvent(event);

    const response = await this.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: gEvent,
    });

    return this.transformGoogleEvent(response.result);
  }
}

// 使用例
const useGoogleCalendarSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const integration = useMemo(() => new GoogleCalendarIntegration(), []);

  const syncWithGoogle = useCallback(async () => {
    if (!isConnected) return;

    try {
      const dateRange = getMonthRange(new Date());
      const googleEvents = await integration.syncEvents(dateRange);

      // ローカルストアに統合
      useEventStore.getState().mergeExternalEvents(googleEvents);
      setLastSync(new Date());
    } catch (error) {
      console.error('Google Calendar sync failed:', error);
      // エラー通知
    }
  }, [isConnected, integration]);

  return { isConnected, lastSync, syncWithGoogle };
};
```

### Outlook Calendar API

```typescript
// Microsoft Graph API統合
class OutlookCalendarIntegration {
  private msalInstance: PublicClientApplication;

  async authenticate(): Promise<AuthenticationResult> {
    const request = {
      scopes: ['https://graph.microsoft.com/calendars.read'],
      account: this.msalInstance.getAllAccounts()[0],
    };

    return await this.msalInstance.acquireTokenSilent(request);
  }

  async fetchEvents(dateRange: DateRange): Promise<Event[]> {
    const token = await this.authenticate();

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        startDateTime: dateRange.start.toISOString(),
        endDateTime: dateRange.end.toISOString(),
      },
    });

    const data = await response.json();
    return data.value.map(this.transformOutlookEvent);
  }
}
```

### WebDAV CalDAV統合

```typescript
// CalDAV protocol support
class CalDAVIntegration {
  private caldavClient: DAVClient;

  constructor(serverUrl: string, credentials: CalDAVCredentials) {
    this.caldavClient = new DAVClient({
      serverUrl,
      credentials,
      defaultAccountType: 'caldav',
    });
  }

  async syncCalendars(): Promise<Calendar[]> {
    const calendars = await this.caldavClient.fetchCalendars();

    return calendars.map((cal) => ({
      id: cal.url,
      name: cal.displayName,
      color: cal.color,
      source: 'caldav',
      url: cal.url,
    }));
  }

  async fetchEvents(calendarUrl: string, dateRange: DateRange): Promise<Event[]> {
    const calendarObjects = await this.caldavClient.fetchCalendarObjects({
      calendar: { url: calendarUrl },
      timeRange: {
        start: dateRange.start,
        end: dateRange.end,
      },
    });

    return calendarObjects.map(this.parseICalEvent);
  }
}
```

---

## 📱 Mobile & PWA統合

### React Native統合

```typescript
// React Native Calendar Bridge
interface NativeCalendarModule {
  requestPermissions(): Promise<boolean>
  getEvents(startDate: string, endDate: string): Promise<NativeEvent[]>
  createEvent(event: NativeEventInput): Promise<string>
  updateEvent(eventId: string, event: NativeEventInput): Promise<void>
  deleteEvent(eventId: string): Promise<void>
}

// Native Module Bridge
const CalendarBridge = NativeModules.CalendarModule as NativeCalendarModule

// React Native用のカレンダーコンポーネント
const NativeCalendarView = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [nativeEvents, setNativeEvents] = useState<NativeEvent[]>([])

  useEffect(() => {
    const requestPermission = async () => {
      const granted = await CalendarBridge.requestPermissions()
      setHasPermission(granted)

      if (granted) {
        const events = await CalendarBridge.getEvents(
          startOfWeek(new Date()).toISOString(),
          endOfWeek(new Date()).toISOString()
        )
        setNativeEvents(events)
      }
    }

    requestPermission()
  }, [])

  return hasPermission ? (
    <CalendarWebView nativeEvents={nativeEvents} />
  ) : (
    <PermissionRequiredView />
  )
}
```

### PWA統合

```typescript
// Service Worker でのオフライン対応
// sw.js
const CALENDAR_CACHE = 'calendar-v1';
const CALENDAR_URLS = ['/api/events', '/api/tasks', '/calendar'];

self.addEventListener('fetch', (event) => {
  if (CALENDAR_URLS.some((url) => event.request.url.includes(url))) {
    event.respondWith(
      caches.open(CALENDAR_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // キャッシュから返す
            fetch(event.request)
              .then((fetchResponse) => {
                cache.put(event.request, fetchResponse.clone());
              })
              .catch(() => {}); // ネットワークエラーは無視

            return response;
          }

          // ネットワークから取得してキャッシュ
          return fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }),
    );
  }
});

// Push通知
self.addEventListener('push', (event) => {
  const data = event.data.json();

  if (data.type === 'calendar_reminder') {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/calendar-192x192.png',
        badge: '/icons/calendar-badge-72x72.png',
        actions: [
          { action: 'view', title: '確認' },
          { action: 'snooze', title: '5分後に再通知' },
        ],
        data: data.eventId,
      }),
    );
  }
});
```

---

## 🧪 Testing統合

### Testing Library統合

```typescript
// Calendar Testing Utilities
export const calendarTestUtils = {
  // カスタムレンダーラー
  renderCalendarView: (component: React.ReactElement, options = {}) => {
    const AllProviders = ({ children }) => (
      <CalendarProvider>
        <QueryClient client={queryClient}>
          <ThemeProvider theme={testTheme}>
            {children}
          </ThemeProvider>
        </QueryClient>
      </CalendarProvider>
    )

    return render(component, { wrapper: AllProviders, ...options })
  },

  // テストデータ生成
  createMockEvent: (overrides = {}): CalendarEvent => ({
    id: `event-${Date.now()}`,
    title: 'Test Event',
    startDate: new Date('2025-01-01T09:00:00'),
    endDate: new Date('2025-01-01T10:00:00'),
    description: 'Test Description',
    ...overrides
  }),

  // イベント操作ヘルパー
  clickTimeSlot: async (hour: number, minute = 0) => {
    const timeSlot = screen.getByTestId(`time-slot-${hour}-${minute}`)
    await user.click(timeSlot)
  },

  dragEvent: async (eventId: string, targetTime: string) => {
    const event = screen.getByTestId(`event-${eventId}`)
    const target = screen.getByTestId(`time-slot-${targetTime}`)

    await user.drag(event, target)
  }
}

// 統合テスト例
describe('Calendar Integration', () => {
  it('イベント作成からビュー更新まで統合動作', async () => {
    const { renderCalendarView, createMockEvent, clickTimeSlot } = calendarTestUtils

    renderCalendarView(<DayView />)

    // 時間スロットクリックでポップアップ表示
    await clickTimeSlot(9, 0)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // イベント情報入力
    await user.type(screen.getByLabelText('タイトル'), 'New Event')
    await user.click(screen.getByText('保存'))

    // ビューに反映されることを確認
    await waitFor(() => {
      expect(screen.getByText('New Event')).toBeInTheDocument()
    })
  })
})
```

### E2E Testing (Playwright)

```typescript
// E2E テストシナリオ
test.describe('Calendar E2E Flow', () => {
  test('カレンダー全体のワークフロー', async ({ page }) => {
    await page.goto('/calendar');

    // 週表示に切り替え
    await page.click('[data-testid="view-selector-week"]');
    await expect(page.locator('.week-view')).toBeVisible();

    // イベント作成
    await page.click('[data-testid="time-slot-09-00"]');
    await page.fill('[data-testid="event-title"]', 'Meeting');
    await page.click('[data-testid="save-event"]');

    // 作成されたイベントが表示されることを確認
    await expect(page.locator('[data-testid="event-Meeting"]')).toBeVisible();

    // 日表示に切り替えてもイベントが見えることを確認
    await page.click('[data-testid="view-selector-day"]');
    await expect(page.locator('[data-testid="event-Meeting"]')).toBeVisible();
  });
});
```

---

## 🔧 Build & Deployment統合

### Webpack/Vite統合

```typescript
// Calendar module の動的インポート
const CalendarModule = {
  // Code Splitting by View
  DayView: () => import('./views/DayView'),
  WeekView: () => import('./views/WeekView'),
  AgendaView: () => import('./views/AgendaView'),

  // Lazy loading with Suspense
  renderView: (viewType: CalendarViewType) => {
    const ViewComponent = lazy(() => CalendarModule[`${viewType}View`]())

    return (
      <Suspense fallback={<CalendarSkeleton viewType={viewType} />}>
        <ViewComponent />
      </Suspense>
    )
  }
}

// Bundle analysis
// webpack-bundle-analyzer での最適化
const calendarBundleConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        calendar: {
          test: /[\\/]calendar[\\/]/,
          name: 'calendar',
          priority: 10
        },
        calendarViews: {
          test: /[\\/]calendar[\\/]views[\\/]/,
          name: 'calendar-views',
          priority: 20
        }
      }
    }
  }
}
```

### Docker統合

```dockerfile
# Calendar機能の最適化されたビルド
FROM node:18-alpine as calendar-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Calendar特定の依存関係
COPY src/features/calendar ./src/features/calendar
COPY src/components ./src/components
COPY src/lib ./src/lib

# Calendar最適化ビルド
RUN npm run build:calendar

FROM nginx:alpine
COPY --from=calendar-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📊 Monitoring & Analytics統合

### Performance Monitoring

```typescript
// Calendar パフォーマンス監視
const useCalendarPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  // レンダリングパフォーマンス
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('calendar')) {
          setMetrics((prev) => ({
            ...prev,
            [entry.name]: entry.duration,
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, []);

  // メモリ使用量監視
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMetrics((prev) => ({
        ...prev,
        memory: {
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit,
        },
      }));
    }
  }, []);

  return { metrics, trackMemoryUsage };
};

// Analytics Events
const useCalendarAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any>) => {
    // Google Analytics
    gtag('event', eventName, {
      event_category: 'calendar',
      ...properties,
    });

    // カスタム分析
    analytics.track(`calendar_${eventName}`, properties);
  }, []);

  const trackViewChange = useCallback(
    (fromView: string, toView: string) => {
      trackEvent('view_change', {
        from_view: fromView,
        to_view: toView,
        timestamp: new Date().toISOString(),
      });
    },
    [trackEvent],
  );

  const trackEventCreation = useCallback(
    (event: CalendarEvent) => {
      trackEvent('event_created', {
        event_type: event.type,
        has_location: Boolean(event.location),
        duration_minutes: event.duration,
        is_all_day: event.isAllDay,
      });
    },
    [trackEvent],
  );

  return { trackViewChange, trackEventCreation };
};
```

### Error Tracking

```typescript
// Sentry統合
import * as Sentry from '@sentry/react'

// Calendar特定のエラー追跡
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      // Calendar関連のトランザクション
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      )
    })
  ],
  beforeSend(event) {
    // Calendar関連エラーに追加コンテキスト
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
      frame => frame.filename?.includes('calendar')
    )) {
      event.tags = {
        ...event.tags,
        component: 'calendar'
      }

      event.contexts = {
        ...event.contexts,
        calendar: {
          current_view: useCalendarStore.getState().currentView,
          event_count: useEventStore.getState().events.length,
          settings: useCalendarSettingsStore.getState()
        }
      }
    }

    return event
  }
})

// Calendar Error Boundary with Sentry
const CalendarErrorBoundary = Sentry.withErrorBoundary(CalendarApp, {
  fallback: ({ error, resetError }) => (
    <div className="error-boundary">
      <h2>カレンダーでエラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>再試行</button>
    </div>
  ),
  beforeCapture: (scope) => {
    scope.setTag('component', 'calendar')
  }
})
```

---

## 🎯 Best Practices

### 1. API統合

```typescript
// ✅ Good: 統一されたAPI抽象化
interface CalendarAPI {
  fetchEvents(range: DateRange): Promise<Event[]>
  createEvent(event: CreateEventInput): Promise<Event>
  updateEvent(id: string, event: UpdateEventInput): Promise<Event>
  deleteEvent(id: string): Promise<void>
}

class UnifiedCalendarAPI implements CalendarAPI {
  constructor(private providers: CalendarProvider[]) {}

  async fetchEvents(range: DateRange): Promise<Event[]> {
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.fetchEvents(range))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<Event[]> =>
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value)
  }
}

// ❌ Bad: 直接的なAPI呼び出し
const fetchGoogleEvents = () => gapi.client.calendar.events.list(...)
const fetchOutlookEvents = () => fetch('/api/outlook/events')
```

### 2. エラーハンドリング

```typescript
// ✅ Good: 階層的エラーハンドリング
class CalendarIntegrationError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'CalendarIntegrationError';
  }
}

const handleAPIError = (error: Error, provider: string) => {
  if (error instanceof CalendarIntegrationError) {
    // すでにラップされたエラー
    throw error;
  }

  // プロバイダー固有のエラー変換
  const message =
    provider === 'google'
      ? 'Google Calendarとの同期に失敗しました'
      : 'カレンダー同期に失敗しました';

  throw new CalendarIntegrationError(message, provider, error);
};
```

### 3. 型安全性

```typescript
// ✅ Good: 厳密な型定義と変換
interface ExternalEvent {
  readonly source: 'google' | 'outlook' | 'caldav';
  readonly externalId: string;
  readonly rawData: unknown;
}

interface InternalEvent extends Event {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const transformExternalEvent = (external: ExternalEvent): InternalEvent => {
  // 型安全な変換ロジック
  switch (external.source) {
    case 'google':
      return transformGoogleEvent(external.rawData as GoogleEvent);
    case 'outlook':
      return transformOutlookEvent(external.rawData as OutlookEvent);
    default:
      throw new Error(`Unsupported source: ${external.source}`);
  }
};
```

---

_このドキュメントは Calendar Integration Patterns の詳細を説明しています。_  
_更新日: 2025-01-XX_  
_責任者: Calendar Development Team_
