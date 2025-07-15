import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusIcon, EditIcon, TrashIcon, HeartIcon, SettingsIcon, UserIcon, LogOutIcon, MoreHorizontalIcon } from "lucide-react"

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

      {/* Form Components Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Form Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input & Label</CardTitle>
              <CardDescription>フォーム要素のテスト</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select & Dropdown</CardTitle>
              <CardDescription>選択系コンポーネントのテスト</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Actions</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontalIcon />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIcon />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOutIcon />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Components Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Modal Components</h2>
        
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Example</DialogTitle>
                <DialogDescription>
                  This is a dialog modal example with shadcn/ui components.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-name">Task Name</Label>
                  <Input id="dialog-name" placeholder="Enter task name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-desc">Description</Label>
                  <Input id="dialog-desc" placeholder="Enter description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet Example</SheetTitle>
                <SheetDescription>
                  This is a side sheet panel for additional content.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Settings</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications</span>
                      <Button size="sm" variant="outline">Toggle</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dark Mode</span>
                      <Button size="sm" variant="outline">Toggle</Button>
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button className="w-full">Save Changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* Badge & Card Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Badge & Card Components</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Badge Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Task Management
                  <Badge variant="secondary">Beta</Badge>
                </CardTitle>
                <CardDescription>
                  Organize your tasks efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create, manage, and track your daily tasks with ease.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Calendar View
                  <Badge>New</Badge>
                </CardTitle>
                <CardDescription>
                  Schedule and plan your activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visual calendar interface for better planning.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Team Collaboration
                  <Badge variant="destructive">Premium</Badge>
                </CardTitle>
                <CardDescription>
                  Work together seamlessly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share tasks and collaborate with your team.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary" className="w-full">Upgrade</Button>
              </CardFooter>
            </Card>
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