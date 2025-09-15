/**
 * パフォーマンス最適化ルールのテストファイル
 */

import React, { useState, useEffect } from 'react';

// ❌ 複雑なコンポーネント（React.memo使用推奨）
export const ComplexComponent = ({ data, onUpdate, settings, user }: any) => {
  const [state, setState] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 複雑な処理
  }, [data]);

  useEffect(() => {
    // さらに複雑な処理
  }, [settings]);

  // ❌ レンダー内での重い処理
  const processedData = JSON.parse(JSON.stringify(data));
  const timestamp = new Date().getTime();
  const randomValue = Math.random();

  // ❌ 配列メソッドをレンダー内で実行
  const filteredData = data.filter((item: any) => item.active);
  const sortedData = filteredData.sort((a: any, b: any) => a.priority - b.priority);

  // ❌ インラインオブジェクト作成
  const handleClick = () => {
    onUpdate({ type: 'click', timestamp: Date.now() });
  };

  // ❌ 関数のbind
  const handleSubmit = function(event: any) {
    event.preventDefault();
  }.bind(this);

  return (
    <div>
      {/* ❌ インラインスタイル */}
      <div style={{ backgroundColor: 'red', padding: '10px' }}>
        Complex Component
      </div>

      {/* ❌ インラインオブジェクト */}
      <button onClick={handleClick} data-config={{ enabled: true, mode: 'fast' }}>
        Click Me
      </button>

      {/* ❌ レンダー内でのオブジェクト作成 */}
      {sortedData.map((item: any, index: number) => (
        <div 
          key={index}  // ❌ 配列インデックスをkeyに使用
          className="item"
          style={{ opacity: item.active ? 1 : 0.5 }}  // ❌ インラインスタイル
        >
          {item.name}
        </div>
      ))}

      {/* ❌ レンダー内での条件分岐が多い */}
      {user && user.isActive && user.hasPermission && user.settings && (
        <div>
          {user.settings.showAdvanced && (
            <div>
              {user.settings.theme === 'dark' ? (
                <span>Dark Mode</span>
              ) : (
                <span>Light Mode</span>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

// ❌ 巨大な関数（max-lines-per-functionに違反）
export const LargeFunctionComponent = () => {
  // 50行を超える関数
  const [state1, setState1] = useState('');
  const [state2, setState2] = useState('');
  const [state3, setState3] = useState('');
  const [state4, setState4] = useState('');
  const [state5, setState5] = useState('');

  const handleChange1 = () => setState1('changed');
  const handleChange2 = () => setState2('changed');
  const handleChange3 = () => setState3('changed');
  const handleChange4 = () => setState4('changed');
  const handleChange5 = () => setState5('changed');

  return (
    <div>
      <input onChange={handleChange1} />
      <input onChange={handleChange2} />
      <input onChange={handleChange3} />
      <input onChange={handleChange4} />
      <input onChange={handleChange5} />
      <div>{state1}</div>
      <div>{state2}</div>
      <div>{state3}</div>
      <div>{state4}</div>
      <div>{state5}</div>
      {/* さらに多くの要素... */}
    </div>
  );
};

// ❌ 複雑な関数（complexity違反）
export const ComplexFunction = (a: number, b: number, c: number, d: number, e: number) => {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (e > 0) {
            return a + b + c + d + e;
          } else {
            return a + b + c + d;
          }
        } else {
          return a + b + c;
        }
      } else {
        return a + b;
      }
    } else {
      return a;
    }
  } else {
    return 0;
  }
};

// ✅ 最適化された例
const STATIC_STYLE = { backgroundColor: 'blue', padding: '8px' };
const STATIC_CONFIG = { enabled: true, mode: 'fast' };

export const OptimizedComponent = React.memo(({ data, onUpdate }: any) => {
  const processedData = React.useMemo(() => {
    return data.filter((item: any) => item.active)
                .sort((a: any, b: any) => a.priority - b.priority);
  }, [data]);

  const handleClick = React.useCallback(() => {
    onUpdate({ type: 'click', timestamp: Date.now() });
  }, [onUpdate]);

  return (
    <div>
      <div style={STATIC_STYLE}>
        Optimized Component
      </div>
      
      <button onClick={handleClick} data-config={STATIC_CONFIG}>
        Click Me
      </button>

      {processedData.map((item: any) => (
        <div key={item.id} className="item">
          {item.name}
        </div>
      ))}
    </div>
  );
});