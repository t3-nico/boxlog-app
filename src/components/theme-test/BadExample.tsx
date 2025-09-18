/**
 * Theme Enforcement テスト用 - 悪い例
 * このファイルでtheme違反が検出されるかテスト
 */

export const BadExample = () => {
  return (
    <div className="rounded-lg bg-blue-500 p-4 text-white">
      <h1 className="mb-2 text-2xl font-bold">直接的なTailwindクラス使用例</h1>
      <p className="text-sm text-gray-300">このコンポーネントはtheme violationを含んでいます</p>
      <button className="mt-4 rounded bg-red-600 px-4 py-2 hover:bg-red-700">違反ボタン</button>
    </div>
  )
}
