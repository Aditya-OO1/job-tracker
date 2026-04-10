import { useState, useEffect } from 'react';
import { Application, ApplicationFormData, KanbanStatus, KANBAN_COLUMNS, ResumeSuggestion } from '@/types';
import { applicationsApi } from '@/services/api';
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications';
import toast from 'react-hot-toast';
import SkillTag from '@/components/ui/SkillTag';

interface Props {
  onClose: () => void;
  editApp?: Application | null;
}

const EMPTY_FORM: ApplicationFormData = {
  company: '', role: '', status: 'Applied', jdLink: '', notes: '',
  dateApplied: new Date().toISOString().split('T')[0],
  salaryRange: '', requiredSkills: [], niceToHaveSkills: [],
  seniority: '', location: '', resumeSuggestions: [],
};

export default function AddApplicationModal({ onClose, editApp }: Props) {
  const [step, setStep] = useState<'jd' | 'form'>(editApp ? 'form' : 'jd');
  const [jdText, setJdText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState<ApplicationFormData>(
    editApp
      ? {
          company: editApp.company, role: editApp.role, status: editApp.status,
          jdLink: editApp.jdLink || '', notes: editApp.notes || '',
          dateApplied: editApp.dateApplied.split('T')[0],
          salaryRange: editApp.salaryRange || '',
          requiredSkills: editApp.requiredSkills, niceToHaveSkills: editApp.niceToHaveSkills,
          seniority: editApp.seniority || '', location: editApp.location || '',
          resumeSuggestions: editApp.resumeSuggestions,
        }
      : { ...EMPTY_FORM }
  );
  const [skillInput, setSkillInput] = useState('');
  const [niceSkillInput, setNiceSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleParse = async () => {
    if (jdText.trim().length < 50) {
      toast.error('Paste a full job description (at least 50 chars)');
      return;
    }
    setParsing(true);
    try {
      const result = await applicationsApi.parseJD(jdText);
      setForm((prev) => ({
        ...prev,
        company: result.parsed.company || prev.company,
        role: result.parsed.role || prev.role,
        requiredSkills: result.parsed.requiredSkills,
        niceToHaveSkills: result.parsed.niceToHaveSkills,
        seniority: result.parsed.seniority || prev.seniority,
        location: result.parsed.location || prev.location,
        resumeSuggestions: result.suggestions,
      }));
      setStep('form');
      toast.success('Job description parsed!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Parsing failed';
      toast.error(msg);
    } finally {
      setParsing(false);
    }
  };

  const addSkill = (type: 'required' | 'nice') => {
    const val = type === 'required' ? skillInput.trim() : niceSkillInput.trim();
    if (!val) return;
    if (type === 'required') {
      setForm((p) => ({ ...p, requiredSkills: [...p.requiredSkills, val] }));
      setSkillInput('');
    } else {
      setForm((p) => ({ ...p, niceToHaveSkills: [...p.niceToHaveSkills, val] }));
      setNiceSkillInput('');
    }
  };

  const removeSkill = (type: 'required' | 'nice', skill: string) => {
    if (type === 'required') setForm((p) => ({ ...p, requiredSkills: p.requiredSkills.filter((s) => s !== skill) }));
    else setForm((p) => ({ ...p, niceToHaveSkills: p.niceToHaveSkills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    if (!form.company || !form.role) {
      toast.error('Company and role are required');
      return;
    }
    setSaving(true);
    try {
      if (editApp) {
        await updateApp.mutateAsync({ id: editApp._id, payload: form });
        toast.success('Application updated!');
      } else {
        await createApp.mutateAsync(form);
      }
      onClose();
    } catch  finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      toast.error('Could not copy to clipboard');
    }
  };

  const field = (key: keyof ApplicationFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass rounded-2xl animate-scale-in overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              {editApp ? 'Edit Application' : step === 'jd' ? 'Parse Job Description' : 'Add Application'}
            </h2>
            {!editApp && (
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${step === 'jd' ? 'bg-accent' : 'bg-success'}`} />
                <span className="text-xs text-slate-light">
                  {step === 'jd' ? 'Step 1: Paste JD' : 'Step 2: Review & Save'}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-slate-light hover:text-white transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          
          {step === 'jd' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="label">Job Description</label>
                <textarea
                  className="input-field resize-none"
                  rows={12}
                  placeholder="Paste the full job description here. AI will extract the company, role, required skills, location, seniority level, and generate tailored resume bullet points…"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleParse} disabled={parsing} className="btn-primary flex items-center gap-2">
                  {parsing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Parsing with AI…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                      </svg>
                      Parse with AI
                    </>
                  )}
                </button>
                <button onClick={() => setStep('form')} className="btn-ghost">
                  Skip, fill manually
                </button>
              </div>
              {parsing && (
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="shimmer-bg h-3 rounded w-3/4" />
                  <div className="shimmer-bg h-3 rounded w-1/2" />
                  <div className="shimmer-bg h-3 rounded w-2/3" />
                  <p className="text-xs text-slate-light mt-3">Analyzing job description…</p>
                </div>
              )}
            </div>
          )}

          
          {step === 'form' && (
            <div className="space-y-5 animate-fade-in">
              
              {!editApp && (
                <button onClick={() => setStep('jd')} className="flex items-center gap-1 text-xs text-slate-light hover:text-accent transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Back to JD parser
                </button>
              )}

              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company *</label>
                  <input className="input-field" placeholder="Acme Corp" value={form.company} onChange={field('company')} />
                </div>
                <div>
                  <label className="label">Role *</label>
                  <input className="input-field" placeholder="Senior Engineer" value={form.role} onChange={field('role')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={field('status')}>
                    {KANBAN_COLUMNS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Date Applied</label>
                  <input type="date" className="input-field" value={form.dateApplied} onChange={field('dateApplied')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Location</label>
                  <input className="input-field" placeholder="Remote / NYC" value={form.location} onChange={field('location')} />
                </div>
                <div>
                  <label className="label">Seniority</label>
                  <input className="input-field" placeholder="Senior" value={form.seniority} onChange={field('seniority')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Salary Range (optional)</label>
                  <input className="input-field" placeholder="$120k–$150k" value={form.salaryRange} onChange={field('salaryRange')} />
                </div>
                <div>
                  <label className="label">JD Link (optional)</label>
                  <input className="input-field" placeholder="https://..." value={form.jdLink} onChange={field('jdLink')} />
                </div>
              </div>

              
              <div>
                <label className="label">Required Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.requiredSkills.map((s) => (
                    <button key={s} onClick={() => removeSkill('required', s)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/10 text-accent-bright border border-accent/20 hover:bg-danger/20 hover:text-red-300 transition-colors">
                      {s} ×
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input-field" placeholder="Add skill…" value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('required'); } }}
                  />
                  <button onClick={() => addSkill('required')} className="btn-ghost flex-shrink-0">Add</button>
                </div>
              </div>

              
              <div>
                <label className="label">Nice-to-Have Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.niceToHaveSkills.map((s) => (
                    <button key={s} onClick={() => removeSkill('nice', s)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-light border border-border hover:bg-danger/20 hover:text-red-300 transition-colors">
                      {s} ×
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input-field" placeholder="Add skill…" value={niceSkillInput}
                    onChange={(e) => setNiceSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('nice'); } }}
                  />
                  <button onClick={() => addSkill('nice')} className="btn-ghost flex-shrink-0">Add</button>
                </div>
              </div>

              
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Recruiter contact, interview notes…"
                  value={form.notes} onChange={field('notes')} />
              </div>

              
              {form.resumeSuggestions.length > 0 && (
                <div>
                  <label className="label flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                    </svg>
                    AI Resume Suggestions
                  </label>
                  <div className="space-y-2">
                    {form.resumeSuggestions.map((s: ResumeSuggestion) => (
                      <div key={s.id} className="flex items-start gap-3 glass rounded-xl p-3 group/sug border border-border hover:border-accent/20 transition-colors">
                        <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <p className="text-sm text-white/90 flex-1 leading-relaxed font-body">{s.text}</p>
                        <button
                          onClick={() => copyToClipboard(s.text, s.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-light hover:text-white hover:bg-white/10 transition-all"
                          title="Copy"
                        >
                          {copiedId === s.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22D3A5" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
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
            </div>
          )}
        </div>

        
        {step === 'form' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Saving…
                </>
              ) : editApp ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
