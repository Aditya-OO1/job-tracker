import { useState } from 'react';
import { format } from 'date-fns';
import { Application } from '@/types';
import { useDeleteApplication } from '@/hooks/useApplications';
import StatusBadge from '@/components/ui/StatusBadge';
import SkillTag from '@/components/ui/SkillTag';
import toast from 'react-hot-toast';

interface Props {
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}

export default function ApplicationDetail({ application, onClose, onEdit }: Props) {
  const deleteApp = useDeleteApplication();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteApp.mutateAsync(application._id);
    onClose();
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col glass rounded-2xl animate-scale-in overflow-hidden">

        
        <div className="px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-sm text-accent-bright">
                    {application.company.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-lg text-white leading-tight truncate">
                    {application.company}
                  </h2>
                  <p className="text-slate-light text-sm truncate">{application.role}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-light hover:text-white transition-colors p-1 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusBadge status={application.status} size="md" />
            {application.seniority && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-border text-slate-light font-body">
                {application.seniority}
              </span>
            )}
            {application.location && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-border text-slate-light font-body flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {application.location}
              </span>
            )}
            {application.salaryRange && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-emerald-300 font-mono">
                {application.salaryRange}
              </span>
            )}
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Date Applied</p>
              <p className="text-sm text-white">{format(new Date(application.dateApplied), 'MMMM d, yyyy')}</p>
            </div>
            {application.jdLink && (
              <div>
                <p className="label">Job Link</p>
                <a href={application.jdLink} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-accent-bright hover:text-white transition-colors truncate block">
                  View Posting ↗
                </a>
              </div>
            )}
          </div>

          
          {application.requiredSkills.length > 0 && (
            <div>
              <p className="label">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {application.requiredSkills.map((s) => <SkillTag key={s} label={s} variant="required" />)}
              </div>
            </div>
          )}

          {application.niceToHaveSkills.length > 0 && (
            <div>
              <p className="label">Nice to Have</p>
              <div className="flex flex-wrap gap-1.5">
                {application.niceToHaveSkills.map((s) => <SkillTag key={s} label={s} variant="nice" />)}
              </div>
            </div>
          )}

          
          {application.notes && (
            <div>
              <p className="label">Notes</p>
              <div className="glass rounded-xl p-3">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{application.notes}</p>
              </div>
            </div>
          )}

          
          {application.resumeSuggestions.length > 0 && (
            <div>
              <p className="label flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                </svg>
                AI Resume Bullets
              </p>
              <div className="space-y-2">
                {application.resumeSuggestions.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 glass rounded-xl p-3 border border-border hover:border-accent/20 transition-colors">
                    <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <p className="text-sm text-white/90 flex-1 leading-relaxed">{s.text}</p>
                    <button onClick={() => copyToClipboard(s.text, s.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-slate-light hover:text-white hover:bg-white/10 transition-all" title="Copy">
                      {copiedId === s.id ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22D3A5" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          <div className="text-xs text-slate-light/50 font-mono pt-2 border-t border-border">
            Added {format(new Date(application.createdAt), 'MMM d, yyyy · h:mm a')}
          </div>
        </div>

        
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleteApp.isPending}
            className={`text-sm px-4 py-2 rounded-xl border transition-all duration-200
              ${confirmDelete
                ? 'bg-danger/20 text-red-300 border-danger/40 hover:bg-danger/30'
                : 'text-slate-light border-border hover:border-danger/40 hover:text-red-300'
              }`}
          >
            {deleteApp.isPending ? 'Deleting…' : confirmDelete ? 'Confirm Delete?' : 'Delete'}
          </button>
          <div className="flex gap-2">
            {confirmDelete && (
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm">Cancel</button>
            )}
            <button onClick={onEdit} className="btn-primary text-sm">Edit Application</button>
          </div>
        </div>
      </div>
    </div>
  );
}
