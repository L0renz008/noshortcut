"use client";

import { useState } from "react";
import { Session } from "@/types";
import Header from "./Header";
import WeekStrip from "./WeekStrip";
import SessionCard from "./SessionCard";

type HomeClientProps = {
  sessions: Session[];
  todayStr: string;
};

export default function HomeClient({ sessions, todayStr }: HomeClientProps) {
  const today = new Date(todayStr);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const selectedSession = sessions.find((s) => s.date === selectedDate);
  const sessionDates = sessions.map((s) => s.date);

  return (
    <div className="p-4">
      <Header />
      <WeekStrip
        today={today}
        sessionDates={sessionDates}
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
      />
      <SessionCard session={selectedSession} />
    </div>
  );
}
