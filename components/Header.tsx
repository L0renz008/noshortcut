import { IconBell } from '@tabler/icons-react';

export default function Header() {
  const month = new Date()
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .toUpperCase();
  const user = { name: 'Lorenzo' }; // Remplacez par les données réelles de l'utilisateur

  return (
    <header className="flex items-center justify-between p-4">
      <div className="text-xl font-bold tracking-wide">
        {month}
      </div>

      <div className="flex items-center gap-4">
        <IconBell className="h-5 w-5 text-slate-700" />
        <div className="rounded-full h-8 w-8 flex items-center justify-center bg-slate-200 text-slate-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
