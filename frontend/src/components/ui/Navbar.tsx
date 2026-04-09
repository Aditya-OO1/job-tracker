import { useAuthStore } from '@/store/authStore';
import { useApplications } from '@/hooks/useApplications';

interface Props {
  onAddClick: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function Navbar({ onAddClick, search, onSearchChange }: Props) {
  const { user, logout } = useAuthStore();
  const { data: apps = [] } = useApplications();

  const stats = {
    total: apps.length,
    offer: apps.filter((a) => a.status === 'Offer').length,
    interview: apps.filter((a) => a.status === 'Interview').length,
  };

  return (
    <header className="glass border-b border-border sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white">Launchpad</span>

          
          {stats.total > 0 && (
            <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-border text-xs text-slate-light">
              <span>{stats.total} tracked</span>
              {stats.interview > 0 && <span className="text-yellow-300">{stats.interview} interview{stats.interview > 1 ? 's' : ''}</span>}
              {stats.offer > 0 && <span className="text-emerald-300">{stats.offer} offer{stats.offer > 1 ? 's' : ''}! 🎉</span>}
            </div>
          )}
        </div>

        
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="w-full bg-ink-muted border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-light/50 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all"
              placeholder="Search companies, roles, skills…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={onAddClick} className="btn-primary flex items-center gap-2 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>

          
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="font-display font-bold text-[10px] text-accent-bright">
                {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
              </span>
            </div>
            <span className="hidden md:block text-sm text-white font-body">{user?.name?.split(' ')[0]}</span>
            <button onClick={logout} title="Sign out"
              className="text-slate-light hover:text-danger transition-colors ml-1 p-1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
