import { Button } from "@/components/ui/button"
import { PlusIcon, EditIcon, TrashIcon, HeartIcon } from "lucide-react"

export default function ShadcnTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">shadcn/ui テストページ</h1>
        <p className="text-muted-foreground">
          shadcn/uiコンポーネントと既存テーマの互換性をテストします
        </p>
      </div>

      {/* Button Variants Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Default Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <HeartIcon />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>
                <PlusIcon />
                Add Item
              </Button>
              <Button variant="secondary">
                <EditIcon />
                Edit
              </Button>
              <Button variant="outline">
                <TrashIcon />
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">States</h3>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>Secondary Disabled</Button>
              <Button variant="outline" disabled>Outline Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Compatibility Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Theme Compatibility Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium">Light Mode Test</h3>
            <p className="text-sm text-muted-foreground">
              既存のライトモードテーマとの互換性
            </p>
            <div className="flex gap-2">
              <Button>Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium">Existing Components Comparison</h3>
            <p className="text-sm text-muted-foreground">
              既存のボタンスタイルとの比較
            </p>
            <div className="flex gap-2">
              <Button>shadcn/ui Button</Button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Existing Button
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Color System Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Color System Test</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background border text-center">
            <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Primary</p>
          </div>
          <div className="p-4 rounded-lg bg-background border text-center">
            <div className="w-8 h-8 bg-secondary rounded mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Secondary</p>
          </div>
          <div className="p-4 rounded-lg bg-background border text-center">
            <div className="w-8 h-8 bg-accent rounded mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Accent</p>
          </div>
          <div className="p-4 rounded-lg bg-background border text-center">
            <div className="w-8 h-8 bg-muted rounded mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Muted</p>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="space-y-4 p-6 rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold">テスト手順</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>このページをライトモードで確認</li>
          <li>ダークモードに切り替えて色の適用を確認</li>
          <li>各ボタンのホバー状態を確認</li>
          <li>レスポンシブデザインを確認（モバイル表示）</li>
          <li>既存のコンポーネントとのデザイン統一性を評価</li>
        </ol>
      </section>
    </div>
  )
}