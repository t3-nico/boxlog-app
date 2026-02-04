import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Stat = ({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) => {
  return (
    <div>
      <Separator />
      <div className="mt-6 text-base font-normal">{title}</div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
      <div className="mt-4 text-sm">
        <Badge variant={change.startsWith('+') ? 'success' : 'destructive'}>{change}</Badge>{' '}
        <span className="text-muted-foreground">from last week</span>
      </div>
    </div>
  );
};
