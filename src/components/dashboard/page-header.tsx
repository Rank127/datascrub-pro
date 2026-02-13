interface PageHeaderProps {
  title: React.ReactNode;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  if (actions) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400">{description}</p>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
