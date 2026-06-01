import { supabase } from "@/lib/supabase";
import { Session } from "@/types";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
  id,
  date,
  week_number,
  blocs (
    id,
    title,
    type,
    format,
    instructions,
    order_index
  )
`,
    )
    .eq("id", id)
    .single();

  if (error) console.error("Error fetching sessions:", error);

  if (error || !data) {
    return <div className="p-4">Séance introuvable</div>;
  }

  const session = data as Session;

  const date = new Date(session.date);

  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <IconChevronLeft size={20} strokeWidth={2} />
        Séances
      </Link>
      <h1 className="text-3xl font-bold">{formattedDate}</h1>
      <p className="text-muted-foreground">
        Semaine {session.week_number} · {session.blocs.length} blocs
      </p>
    </div>
  );
}
