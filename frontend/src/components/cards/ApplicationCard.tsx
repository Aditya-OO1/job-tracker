import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Application } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  application: Application;
  onClick: () => void;
  isDragging?: boolean;
}

export default function ApplicationCard({ application, onClick, isDragging }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group glass rounded-xl p-4 card-drag
        border border-border
        transition-all duration-200
        hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5
        ${isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'}
        animate-fade-in
      `}
    >
      
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-white truncate leading-tight">
              {application.company}
            </p>
            <p className="text-slate-light text-xs truncate mt-0.5 font-body">
              {application.role}
            </p>
          </div>
          
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="font-display font-bold text-[10px] text-accent-bright">
              {application.company.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      
      <div className="flex items-center justify-between">
        <StatusBadge status={application.status} />
        <span className="text-[10px] text-slate-light font-mono">
          {format(new Date(application.dateApplied), 'MMM d')}
        </span>
      </div>

      
      {application.requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {application.requiredSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-light border border-border"
            >
              {skill}
            </span>
          ))}
          {application.requiredSkills.length > 3 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 text-slate-light">
              +{application.requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}

      
      {application.location && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-light">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          {application.location}
        </div>
      )}

      
      {application.salaryRange && (
        <div className="mt-1 text-[10px] text-success font-mono">{application.salaryRange}</div>
      )}
    </div>
  );
}
