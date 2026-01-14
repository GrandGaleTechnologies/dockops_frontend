import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface TableAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  loading?: boolean;
}

interface TableActionsDropdownProps {
  actions: TableAction[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function TableActionsDropdown({
  actions,
  align = 'end',
  className,
}: TableActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('hover:border-primary hover:border', className)}
          aria-label="Open actions menu"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='p-3 space-y-1' align={align}>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            variant={action.destructive ? 'destructive' : 'default'}
            className={cn(
              'hover:border rounded-lg',
              action.destructive && 'text-red-500 focus:text-red-500',
              action.loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.loading ? `${action.label}...` : action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
