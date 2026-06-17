import LiveClient from "@/components/LiveClient";
import { supabase } from "@/lib/supabase";
import { Session } from "@/types";

export default async function Live({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, date, week_number,
      blocs (id,session_id,title,type,order_index,format,is_optional,
      bloc_warmup(bloc_id, reps, unit,order_index,notes,complex_id, movement:movements(id,name,demo_url,category,has_record ) ),
      bloc_strength(id,set_number_start,set_number_end,reps,percentage_min,percentage_max,rest_pattern,notes,option_number,complex_id,movement:movements(id,name,demo_url,category,has_record)),
      bloc_metcon(id,duration_minutes,nb_rounds,notes,bloc_metcon_movements(id,category,reps,unit,load_kg,order_index,notes,complex_id,movement:movements(id,name,demo_url,category,has_record))))`,
    )
    .eq("id", id)
    .single();

  if (error) console.error("Error fetching live session::", error);
  const session = data as Session | null;
  return (
    <div className="p-4">
      <LiveClient session={session} />
    </div>
  );
}
