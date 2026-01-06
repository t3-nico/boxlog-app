'use client';

import { Calendar, MoreVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { parseDateString } from '@/features/calendar/utils/dateUtils';
import type { Plan } from '../../types/plan';
import { PlanStatusBadge } from './PlanStatusBadge';

// tRPC返却値の型（plan_tags を含む）
type PlanWithplanTags = Plan & {
  plan_tags?: Array<{
    tag_id: string;
    tags: { id: string; name: string; color: string; description?: string };
  }>;
};

interface PlanCardProps {
  plan: PlanWithplanTags;
  onEdit?: (plan: PlanWithplanTags) => void;
  onDelete?: (plan: PlanWithplanTags) => void;
  onClick?: (plan: PlanWithplanTags) => void;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export function PlanCard({ plan, onEdit, onDelete, onClick, tags = [] }: PlanCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(plan);
    }
  };

  const handleMenuAction = (action: () => void) => (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Card
      className="group hover:border-primary/50 relative cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="text-foreground line-clamp-2 font-semibold">{plan.title}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 opacity-100 transition-opacity sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onSelect={handleMenuAction(() => onEdit(plan))}>
                  編集
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleMenuAction(() => onDelete(plan))}
                    className="text-destructive focus:text-destructive"
                  >
                    削除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ステータス */}
        <div className="flex flex-wrap gap-2">
          <PlanStatusBadge status={plan.status} />
        </div>

        {/* 期限日 */}
        {plan.due_date && (
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{parseDateString(plan.due_date).toLocaleDateString('ja-JP')}</span>
          </div>
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 説明（省略形） */}
        {plan.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{plan.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Backward compatibility
export { PlanCard as planCard };
