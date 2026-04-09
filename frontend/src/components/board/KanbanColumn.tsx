import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, KanbanStatus } from '@/types';
import ApplicationCard from '@/components/cards/ApplicationCard';

const COLUMN_CONFIG: Record<KanbanStatus, { accent: string; glow: string; count: string }> = {
  'Applied':      { accent: 'border-t-accent',       glow: 'shadow-accent/10',    count: 'bg-accent/20 text-accent-bright' },
  'Phone Screen': { accent: 'border-t-blue-500',     glow: 'shadow-blue-500/10',  count: 'bg-blue-500/20 text-blue-300' },
  'Interview':    { accent: 'border-t-yellow-500',   glow: 'shadow-yellow-500/10', count: 'bg-yellow-500/20 text-yellow-300' },
  'Offer':        { accent: 'border-t-emerald-500',  glow: 'shadow-emerald-500/10', count: 'bg-emerald-500/20 text-emerald-300' },
  'Rejected':     { accent: 'border-t-red-500',      glow: 'shadow-red-500/10',   count: 'bg-red-500/20 text-red-300' },
};

interface Props {
  status: KanbanStatus;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, applications, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = COLUMN_CONFIG[status];

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      
      <div className={`glass rounded-xl p-4 mb-3 border-t-2 ${cfg.accent}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-white">{status}</h3>
          <span className={`text-xs font-display font-bold px-2 py-0.5 rounded-full ${cfg.count}`}>
            {applications.length}
          </span>
        </div>
      </div>

      
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-xl min-h-[200px] p-2 transition-all duration-200
          ${isOver
            ? 'bg-accent/5 border-2 border-dashed border-accent/40'
            : 'border-2 border-dashed border-transparent'
          }
        `}
      >
        <SortableContext
          items={applications.map((a) => a._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                application={app}
                onClick={() => onCardClick(app)}
              />
            ))}
          </div>
        </SortableContext>

        {applications.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-light">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <p className="text-xs text-slate-light">Drop cards here</p>
          </div>
        )}
      </div>
    </div>
  );
}
