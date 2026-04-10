import { useState, useMemo } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners, DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Application, KanbanStatus, KANBAN_COLUMNS } from '@/types';
import { useApplications, useUpdateApplication } from '@/hooks/useApplications';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from '@/components/cards/ApplicationCard';

interface Props {
  onCardClick: (app: Application) => void;
  search: string;
}

export default function KanbanBoard({ onCardClick, search }: Props) {
  const { data: applications = [], isLoading, error } = useApplications();
  const updateApp = useUpdateApplication();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }, [applications, search]);

  const byStatus = useMemo(() => {
    const map: Record<KanbanStatus, Application[]> = {
      'Applied': [], 'Phone Screen': [], 'Interview': [], 'Offer': [], 'Rejected': [],
    };
    filtered.forEach((a) => { if (map[a.status]) map[a.status].push(a); });
    return map;
  }, [filtered]);

  const activeApp = useMemo(() => applications.find((a) => a._id === activeId), [applications, activeId]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeStatus = applications.find((a) => a._id === active.id)?.status;
    const overStatus = KANBAN_COLUMNS.includes(over.id as KanbanStatus)
      ? (over.id as KanbanStatus)
      : applications.find((a) => a._id === over.id)?.status;

    if (activeStatus && overStatus && activeStatus !== overStatus) {
      updateApp.mutate({ id: String(active.id), payload: { status: overStatus } });
    }
  };

  const handleDragEnd = (_e: DragEndEvent) => {
    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col} className="min-w-[280px] w-[280px]">
            <div className="shimmer-bg h-16 rounded-xl mb-3" />
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="shimmer-bg h-28 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <p className="text-danger font-display font-semibold">Failed to load applications</p>
          <p className="text-sm text-slate-light mt-1">Check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={byStatus[status]}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && (
          <div className="opacity-90 rotate-1 scale-105">
            <ApplicationCard application={activeApp} onClick={() => {}} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
