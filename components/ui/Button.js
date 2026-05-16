export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-indigo-500/20",
    secondary:
      "bg-card hover:bg-card-hover text-foreground border border-border",
    ghost: "hover:bg-card-hover text-muted hover:text-foreground",
    danger: "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
