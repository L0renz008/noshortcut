import { Bloc } from "@/types";
import { IconChevronRight } from "@tabler/icons-react";

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

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const capitalizeWords = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
            <span className="rounded-full bg-black/18 px-3 py-1 text-xs uppercase leading-none">
              {bloc.format}
            </span>
          ) : null}
          {bloc.is_optional ? (
            <span className="rounded-full bg-black/18 px-3 py-1 text-xs uppercase leading-none">
              {"Optionnel"}
            </span>
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
