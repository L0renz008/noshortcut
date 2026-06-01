import { supabase } from "@/lib/supabase";
import { Session } from "@/types";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";

const BLOC_TYPE_COLORS: Record<string, string> = {
  "Warm up": "#EF9F27",
  Haltéro: "#378ADD",
  Force: "#7F77DD",
  Conditionning: "#D85A30",
  Gym: "#D85A30",
  Accessory: "#1D9E75",
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

  return (
    <div className="min-h-screen bg-[#F6F5F1] p-4">
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
      <div className="mt-8 flex flex-col gap-3">
        {session.blocs.map((bloc) => {
          const blocColor = BLOC_TYPE_COLORS[bloc.type] ?? "#111111";
          return (
            <div
              key={bloc.id}
              className="bg-white border border-[#E8E8E4] rounded-[11px] overflow-hidden"
            >
              <div
                className="rounded-t-[11px] p-2 text-white font-semibold text-sm"
                style={{ backgroundColor: blocColor }}
              >
                {bloc.type}
              </div>
              <p className="text-sm">{bloc.title}</p>
              <p>{bloc.instructions}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
