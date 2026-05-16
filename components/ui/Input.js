export default function Input({ label, id, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 ${className}`}
        {...props}
      />
    </div>
  );
}
