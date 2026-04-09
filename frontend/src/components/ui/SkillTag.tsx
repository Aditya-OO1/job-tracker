interface Props {
  label: string;
  variant?: 'required' | 'nice';
}

export default function SkillTag({ label, variant = 'required' }: Props) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border
        ${variant === 'required'
          ? 'bg-accent/10 text-accent-bright border-accent/20'
          : 'bg-white/5 text-slate-light border-border'
        }`}
    >
      {label}
    </span>
  );
}
