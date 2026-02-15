import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

/** Table - データテーブル（shadcn/ui プリミティブ）。複数属性の比較・ソート・フィルターに使用。 */
const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: '支払済',
    totalAmount: '¥250',
    paymentMethod: 'クレジットカード',
  },
  { invoice: 'INV002', paymentStatus: '保留中', totalAmount: '¥150', paymentMethod: 'PayPal' },
  { invoice: 'INV003', paymentStatus: '未払い', totalAmount: '¥350', paymentMethod: '銀行振込' },
  {
    invoice: 'INV004',
    paymentStatus: '支払済',
    totalAmount: '¥450',
    paymentMethod: 'クレジットカード',
  },
  { invoice: 'INV005', paymentStatus: '支払済', totalAmount: '¥550', paymentMethod: 'PayPal' },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>請求書一覧</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">請求書</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>支払方法</TableHead>
          <TableHead className="text-right">金額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-bold">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>合計</TableCell>
          <TableCell className="text-right">¥1,750</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox aria-label="全選択" />
          </TableHead>
          <TableHead>名前</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>ロール</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: '山田太郎', email: 'taro@example.com', role: '管理者' },
          { name: '鈴木花子', email: 'hanako@example.com', role: '編集者' },
          { name: '田中次郎', email: 'jiro@example.com', role: '閲覧者' },
        ].map((user) => (
          <TableRow key={user.email}>
            <TableCell>
              <Checkbox aria-label={`${user.name}を選択`} />
            </TableCell>
            <TableCell className="font-bold">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Simple: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>商品</TableHead>
          <TableHead>数量</TableHead>
          <TableHead className="text-right">価格</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>商品A</TableCell>
          <TableCell>2</TableCell>
          <TableCell className="text-right">¥1,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>商品B</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">¥2,500</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>商品C</TableCell>
          <TableCell>3</TableCell>
          <TableCell className="text-right">¥500</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>役職</TableHead>
            <TableHead className="text-right">給与</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>山田太郎</TableCell>
            <TableCell>エンジニア</TableCell>
            <TableCell className="text-right">¥500,000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>鈴木花子</TableCell>
            <TableCell>デザイナー</TableCell>
            <TableCell className="text-right">¥450,000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>商品</TableHead>
            <TableHead className="text-right">金額</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>商品A</TableCell>
            <TableCell className="text-right">¥1,000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>商品B</TableCell>
            <TableCell className="text-right">¥2,000</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>合計</TableCell>
            <TableCell className="text-right">¥3,000</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};
