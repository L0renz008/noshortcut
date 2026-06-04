import { supabase } from "@/lib/supabase";
import { Session } from "@/types";
import Link from "next/link";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from "@tabler/icons-react";

const BLOC_TYPE_COLORS: Record<string, string> = {
  "Warm up": "#EF9F27",
  Haltéro: "#378ADD",
  Force: "#7F77DD",
  Conditionning: "#D85A30",
  Gym: "#D85A30",
  Accessory: "#1D9E75",
};

const formatInstructionPreview = (instructions: string | null) => {
  if (!instructions) return "Détails à venir";

  // return instructions.replace(/\s+/g, " ").trim();
  return instructions;
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, date, week_number, blocs (id,title,type,format,instructions,order_index)`,
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
        {sortedBlocs.map((bloc) => {
          const blocColor = BLOC_TYPE_COLORS[bloc.type] ?? "#111111";
          return (
            <article
              key={bloc.id}
              className="overflow-hidden rounded-2xl border border-[#E2E1DD] bg-white"
            >
              <div
                className="flex items-center justify-between px-5 py-2 text-md font-bold text-white"
                style={{ backgroundColor: blocColor }}
              >
                <span>{bloc.type}</span>
                {bloc.format ? (
                  <span className="rounded-full bg-black/18 px-3 py-1 text-sm font-bold uppercase leading-none">
                    {bloc.format}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-sm font-bold leading-tight text-[#171717]">
                    {bloc.title}
                  </h1>
                  <p className="mt-1 truncate text-xs font-semibold leading-tight text-[#B9B9B5]">
                    {formatInstructionPreview(bloc.instructions)}
                  </p>
                </div>
                <IconChevronRight
                  aria-hidden="true"
                  size={24}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#D4D4D0]"
                />
              </div>
            </article>
          );
        })}
      </section>

      <button className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#111111] text-xl font-bold text-white">
        <IconPlayerPlay size={22} strokeWidth={2} />
        Commencer la séance
      </button>
    </div>
  );
}
