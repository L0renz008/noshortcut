import { Bloc, BlocWarmup } from "@/types";
import { capitalizeFirstLetter } from "@/utilityFunctions/utilityFunctions";
import { Badge } from "./ui/badge";

type LiveBlocWarmupProps = {
  bloc: Bloc;
};

function sortMovementsByOrderIndex(movements: BlocWarmup[]) {
  return [...movements].sort((a, b) => a.order_index - b.order_index);
}

function groupByComplex(movements: BlocWarmup[]) {
  const sortedMovements = sortMovementsByOrderIndex(movements);
  const groupesIsoles: BlocWarmup[] = sortedMovements.filter(
    (movement) => movement.complex_id == null,
  );
  const groupesComplex: Record<number, BlocWarmup[]> = {};

  sortedMovements.forEach((movement) => {
    if (movement.complex_id != null && !groupesComplex[movement.complex_id]) {
      groupesComplex[movement.complex_id] = [];
    }

    if (movement.complex_id != null) {
      groupesComplex[movement.complex_id].push(movement);
    }
  });

  return { groupesIsoles, groupesComplex };
}

export default function LiveBlocWarmup({ bloc }: LiveBlocWarmupProps) {
  const { groupesIsoles, groupesComplex } = groupByComplex(
    bloc.bloc_warmup ?? [],
  );
  const nbOfMovements = groupesIsoles.length;
  const nbOfComplexes = Object.keys(groupesComplex).length;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-[19px] font-bold text-[#171717] capitalize">
          {bloc.title}
        </h1>
        <p className="mt-1 text-[11px] text-[#999]">
          {nbOfMovements} mouvements · {nbOfComplexes} complexes
        </p>
      </header>

      <div className="flex flex-col gap-1.5">
        {groupesIsoles.map((movement) => (
          <div
            key={movement.id}
            className="flex items-center justify-between gap-2.5 rounded-[11px] bg-[#F0EFEB] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold capitalize text-[#171717]">
                {movement.movement?.name}
              </p>
              {movement.notes ? (
                <p className="mt-px text-[10.5px] italic text-[#888]">
                  {movement.notes}
                </p>
              ) : null}
            </div>
            {movement.reps || movement.unit ? (
              <Badge
                variant="outline"
                className="shrink-0 whitespace-nowrap bg-white font-bold text-[#171717]"
              >
                {movement.reps} {movement.unit}
              </Badge>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
