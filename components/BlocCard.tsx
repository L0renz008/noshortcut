import { Bloc } from "@/types";
import { IconChevronRight } from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import {
  capitalizeFirstLetter,
  capitalizeWords,
} from "@/utilityFunctions/utilityFunctions";

type BlocCardProps = {
  bloc: Bloc;
};

const BLOC_TYPE_COLORS: Record<string, string> = {
  "warm up": "#EF9F27",
  haltero: "#378ADD",
  force: "#7F77DD",
  conditioning: "#D85A30",
  gym: "#D85A30",
  accessory: "#1D9E75",
};

export default function BlocCard({ bloc }: BlocCardProps) {
  const blocColor = BLOC_TYPE_COLORS[bloc.type] ?? "#111111";
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E2E1DD] bg-white">
      <div
        className="flex items-center justify-between px-5 py-2 text-white"
        style={{ backgroundColor: blocColor }}
      >
        <span className="font-bold text-md">
          {capitalizeFirstLetter(bloc.type)}
        </span>
        <div className="flex items-center gap-1">
          {bloc.format ? (
            <Badge className="bg-black/18 uppercase">{bloc.format}</Badge>
          ) : null}
          {bloc.is_optional ? (
            <Badge className="bg-black/18 uppercase">{"Optionnel"}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold leading-tight text-[#171717]">
            {capitalizeWords(bloc.title)}
          </h1>
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
}
