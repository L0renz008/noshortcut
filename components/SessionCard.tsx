import { Session } from "@/types";
import Link from "next/link";

type SessionCardProps = {
  session: Session | undefined;
};

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function SessionCard({ session }: SessionCardProps) {
  if (!session)
    return (
      <div className="border border-border rounded-2xl p-5 text-muted-foreground text-sm">
        Rien de planifié aujourd&apos;hui
      </div>
    );

  const date = new Date(session.date);
  const jour = date.getDate();
  const mois = date
    .toLocaleDateString("fr-FR", { month: "long" })
    .toUpperCase();
  const annee = date.getFullYear();

  const blocTypes = new Set(
    session.blocs.map((bloc) => capitalizeFirstLetter(bloc.type)),
  );

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="bg-foreground rounded-2xl p-6 flex flex-col gap-4"
    >
      <p className="text-sm text-neutral-400">
        {jour} {mois} {annee} · SEMAINE {session.week_number}
      </p>
      <h2 className="text-2xl font-bold text-background">Séance du jour</h2>
      <div className="flex flex-row flex-wrap gap-2">
        {Array.from(blocTypes).map((type) => (
          <span
            key={type}
            className="rounded-full border border-neutral-600 px-3 py-1 text-sm text-neutral-300"
          >
            {type}
          </span>
        ))}
      </div>
    </Link>
  );
}
