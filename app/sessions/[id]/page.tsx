import { supabase } from "@/lib/supabase";
import { Session } from "@/types";
import Link from "next/link";
import { IconChevronLeft, IconPlayerPlay } from "@tabler/icons-react";
import BlocCard from "@/components/BlocCard";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, date, week_number,
      blocs (id,title,type,order_index,format,is_optional)`,
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

  const sortedBlocs = [...session.blocs].sort(
    (blocA, blocB) => blocA.order_index - blocB.order_index,
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-4">
      <Link
        href="/"
        className="mb-5 inline-flex w-fit items-center gap-2 text-base font-semibold text-[#7A7A76]"
      >
        <IconChevronLeft size={22} strokeWidth={2.2} />
        Séances
      </Link>

      <header>
        <h1 className="text-2xl font-bold tracking-wide">{formattedDate}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Semaine {session.week_number} · {sortedBlocs.length} blocs
        </p>
      </header>

      <section className="mt-7 flex flex-col gap-2">
        {sortedBlocs.map((bloc) => (
          <BlocCard key={bloc.id} bloc={bloc} />
        ))}
      </section>

      <Link
        href={`/sessions/${session.id}/live`}
        className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#111111] text-lg font-bold text-white"
      >
        <IconPlayerPlay size={22} strokeWidth={2} />
        Commencer la séance
      </Link>
    </div>
  );
}
