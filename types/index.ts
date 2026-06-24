export type Movement = {
  id: string;
  name: string;
  demo_url: string | null;
  category: string | null;
  has_record: boolean | null;
  base_movement_id: string | null;
};

export type BlocWarmup = {
  id: string;
  reps: number | null;
  unit: string | null;
  order_index: number;
  notes: string | null;
  complex_id: number | null;
  movement: Movement | null;
};

export type BlocStrength = {
  id: string;
  set_number_start: number | null;
  set_number_end: number | null;
  reps: number | null;
  percentage_min: number | null;
  percentage_max: number | null;
  rest_pattern: string | null;
  rest_seconds: number | null;
  notes: string | null;
  option_number: number | null;
  complex_id: number | null;
  movement: Movement | null;
};

export type BlocMetconMovement = {
  id: string;
  category: "Elite" | "RX" | "Inter" | "Scaled" | null;
  movement: Movement | null;
  reps: number | null;
  unit: string | null;
  load_kg: number | null;
  order_index: number;
  notes: string | null;
  complex_id: number | null;
};

export type BlocMetcon = {
  id: string;
  duration_minutes: number | null;
  nb_rounds: number | null;
  notes: string | null;
  bloc_metcon_movements: BlocMetconMovement[] | null;
};

export type Bloc = {
  id: string;
  title: string;
  type: "warm up" | "haltero" | "force" | "conditioning" | "gym" | "accessory";
  format: "For time" | "AMRAP" | "EMOM" | null;
  order_index: number;
  is_optional: boolean | null;
  interval_seconds: number | null;
  bloc_warmup: BlocWarmup[] | null;
  bloc_strength: BlocStrength[] | null;
  bloc_metcon: BlocMetcon[] | null;
};

export type Session = {
  id: string;
  date: string;
  week_number: number;
  blocs: Bloc[];
};
