import { useState } from 'react';
import { Application } from '@/types';
import Navbar from '@/components/ui/Navbar';
import KanbanBoard from '@/components/board/KanbanBoard';
import AddApplicationModal from '@/components/board/AddApplicationModal';
import ApplicationDetail from '@/components/board/ApplicationDetail';
import { useApplications } from '@/hooks/useApplications';

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'detail'; app: Application }
  | { type: 'edit'; app: Application };

export default function BoardPage() {
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [search, setSearch] = useState('');
  const { data: apps = [] } = useApplications();

  const isEmpty = apps.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onAddClick={() => setModal({ type: 'add' })}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="flex-1 px-6 py-6 max-w-[1600px] mx-auto w-full">
        
        {isEmpty && !search && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
            </div>
            <h2 className="font-display font-bold text-2xl text-white mb-3">
              Your board is empty
            </h2>
            <p className="text-slate-light text-sm max-w-xs leading-relaxed mb-6">
              Add your first job application. Paste a job description and let AI fill in the details for you.
            </p>
            <button
              onClick={() => setModal({ type: 'add' })}
              className="btn-primary flex items-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add First Application
            </button>
          </div>
        )}

        
        {!isEmpty && (
          <KanbanBoard
            onCardClick={(app) => setModal({ type: 'detail', app })}
            search={search}
          />
        )}

        
        {!isEmpty && search && apps.filter((a) =>
          a.company.toLowerCase().includes(search.toLowerCase()) ||
          a.role.toLowerCase().includes(search.toLowerCase())
        ).length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-slate-light">No results for <span className="text-white">"{search}"</span></p>
            <button onClick={() => setSearch('')} className="text-accent-bright text-sm mt-2 hover:text-white transition-colors">
              Clear search
            </button>
          </div>
        )}
      </main>

      
      {modal.type === 'add' && (
        <AddApplicationModal onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'edit' && (
        <AddApplicationModal
          onClose={() => setModal({ type: 'none' })}
          editApp={modal.app}
        />
      )}
      {modal.type === 'detail' && (
        <ApplicationDetail
          application={modal.app}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', app: modal.app })}
        />
      )}
    </div>
  );
}
