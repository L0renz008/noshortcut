import HomeClient from "@/components/HomeClient";
import { supabase } from "@/lib/supabase";
import { Session } from "@/types";

const toISODate = (date: Date) => date.toISOString().split("T")[0];

export default async function Home() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=dim, 1=lun, 2=mar...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  const sunday = new Date(today);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = toISODate(monday);
  const sundayStr = toISODate(sunday);

  const { data } = await supabase
    .from("sessions")
    .select(`id, date, week_number, blocs (type)`)
    .gte("date", mondayStr)
    .lte("date", sundayStr);
  const sessions = (data ?? []) as Session[];

  const todayStr = toISODate(today);

  return (
    <div className="p-4">
      <HomeClient sessions={sessions} todayStr={todayStr} />
    </div>
  );
}
