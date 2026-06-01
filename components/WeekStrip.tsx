type WeekStripProps = {
  today: Date;
  sessionDates: string[];
  selectedDate: string;
  onDaySelect: (date: string) => void;
};
const JOURS = ["D", "L", "M", "M", "J", "V", "S"];

export default function WeekStrip({
  today,
  sessionDates,
  selectedDate,
  onDaySelect,
}: WeekStripProps) {
  const dayOfWeek = today.getDay(); // 0=dim, 1=lun, 2=mar...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(date);
  }
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((today.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  );

  return (
    <div className="pb-1">
      <p className="text-sm text-muted-foreground mb-2 px-4">
        Semaine {weekNumber}
      </p>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          // Transforme YYYY-MM-DDT00:00.000Z en un tableau grâce au .split('T') et prend le premier élément donc YYYY-MM-DD
          const dateStr = day.toISOString().split("T")[0];
          const hasSession = sessionDates.includes(dateStr);

          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 touch-manipulation`}
              onClick={() => onDaySelect(dateStr)}
            >
              <span className="text-sm text-gray-400">
                {JOURS[day.getDay()]}
              </span>

              <span
                className={`rounded-full h-8 w-8 text-sm flex items-center justify-center ${isSelected ? "bg-black text-white" : ""}`}
              >
                {day.getDate()}
              </span>
              <span
                className={`rounded-full h-1 w-1 ${hasSession ? "bg-foreground" : "bg-transparent"}`}
              ></span>
            </div>
          );
        })}
      </div>
      <hr className="border-border my-4" />
    </div>
  );
}
