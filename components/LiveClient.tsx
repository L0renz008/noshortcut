"use client";

import { useRef, useState, useTransition } from "react";
import { Session } from "@/types";
import DotPagination from "./DotPagination";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { capitalizeFirstLetter } from "@/utilityFunctions/utilityFunctions";
import { Badge } from "./ui/badge";
import { IconX } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Spinner } from "./ui/spinner";

type LiveClientProps = {
  session: Session | null;
};

const BLOC_TYPE_COLORS: Record<string, string> = {
  "warm up": "#EF9F27",
  haltero: "#378ADD",
  force: "#7F77DD",
  conditioning: "#D85A30",
  gym: "#D85A30",
  accessory: "#1D9E75",
};

export default function LiveClient({ session }: LiveClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && !isLastBloc) {
      setCurrentIndex((i) => i + 1);
    }
    if (diff < -50 && !isFirstBloc) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  if (!session) return "No session";

  const sortedBlocs = [...session.blocs].sort(
    (blocA, blocB) => blocA.order_index - blocB.order_index,
  );

  const currentBloc = sortedBlocs[currentIndex];
  const isFirstBloc = currentIndex === 0;
  const isLastBloc = currentIndex === sortedBlocs.length - 1;

  const blocColor = BLOC_TYPE_COLORS[currentBloc.type] ?? "#111111";

  return (
    <div
      key={currentIndex}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={isPending}
            className="absolute top-6 right-4"
            variant="destructive"
          >
            {isPending ? <Spinner /> : <IconX />}Quitter
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter la séance ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta progression ne sera pas sauvegardée si tu quittes la séance en
              cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Annuler</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                startTransition(() => {
                  router.push(`/sessions/${session.id}`);
                })
              }
            >
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-center gap-1.5 p-6">
        <DotPagination total={sortedBlocs.length} currentIndex={currentIndex} />
      </div>
      <Card className="pt-0">
        <CardHeader
          className="px-5 py-5 flex items-center justify-between"
          style={{ backgroundColor: blocColor }}
        >
          <CardTitle className="text-white font-bold">
            {capitalizeFirstLetter(currentBloc.type)}
          </CardTitle>
          <div className="flex items-center gap-1">
            {currentBloc.format ? (
              <Badge className="bg-black/18 uppercase">
                {currentBloc.format}
              </Badge>
            ) : null}
            {currentBloc.is_optional ? (
              <Badge className="bg-black/18 uppercase">{"Optionnel"}</Badge>
            ) : null}
          </div>
        </CardHeader>
      </Card>
      <div className="py-4 flex gap-2">
        <Button
          disabled={isFirstBloc}
          variant="outline"
          className="rounded-xl flex-1"
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <IconChevronLeft />
          Préc.
        </Button>
        <Button
          disabled={isLastBloc}
          variant="outline"
          className="rounded-xl flex-2"
          onClick={() => setCurrentIndex((i) => i + 1)}
        >
          Suivant <IconChevronRight />
        </Button>
      </div>
    </div>
  );
}
