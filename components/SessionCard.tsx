import { Session } from "@/types";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { capitalizeFirstLetter } from "@/utilityFunctions/utilityFunctions";

type SessionCardProps = {
  session: Session | undefined;
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
    <div className="flex flex-col gap-2">
      <Link href={`/sessions/${session.id}`}>
        <Card className="[--card-spacing:--spacing(4)] bg-foreground px-3 py-4">
          <CardHeader>
            {/* <CardTitle>Card Title</CardTitle> */}
            <CardDescription>
              {jour} {mois} {annee} · SEMAINE {session.week_number}
            </CardDescription>
            {/* <CardAction>Card Action</CardAction> */}
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-bold text-background">
              Séance du jour
            </h2>
          </CardContent>
          <CardFooter className="gap-2">
            {Array.from(blocTypes).map((type) => (
              <Badge
                className="px-3 py-1 border border-neutral-600 text-neutral-300"
                key={type}
              >
                {type}
              </Badge>
            ))}
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}
