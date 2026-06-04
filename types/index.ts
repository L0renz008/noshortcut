export type BlocVersion = {
  id: string;
  bloc_id: string;
  category: "Elite" | "RX" | "Inter" | "Scaled";
  instructions: string;
};

export type Bloc = {
  id: string;
  title: string;
  type: "Warm up" | "Haltéro" | "Force" | "Conditionning" | "Gym" | "Accessory";
  format: "For time" | "AMRAP" | "EMOM" | null;
  instructions: string | null;
  order_index: number;
  versions: BlocVersion[];
};

export type Session = {
  id: string;
  date: string;
  week_number: number;
  blocs: Bloc[];
};
