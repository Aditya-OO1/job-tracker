import { KanbanStatus } from '@/types';

const STATUS_CONFIG: Record<KanbanStatus, { label: string; color: string; dot: string }> = {
  Applied:      { label: 'Applied',      color: 'bg-accent/15 text-accent-bright border-accent/20',       dot: 'bg-accent' },
  'Phone Screen': { label: 'Phone Screen', color: 'bg-blue-500/15 text-blue-300 border-blue-500/20',       dot: 'bg-blue-400' },
  Interview:    { label: 'Interview',    color: 'bg-warning/15 text-yellow-300 border-warning/20',         dot: 'bg-yellow-400' },
  Offer:        { label: 'Offer',        color: 'bg-success/15 text-emerald-300 border-success/20',        dot: 'bg-emerald-400' },
  Rejected:     { label: 'Rejected',     color: 'bg-danger/15 text-red-300 border-danger/20',              dot: 'bg-red-400' },
};

interface Props {
  status: KanbanStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-display font-semibold
        ${cfg.color}
        ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
