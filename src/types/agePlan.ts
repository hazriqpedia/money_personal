export interface AgePlanNote {
  id: string;
  text: string;
}

export interface PlanItem extends AgePlanNote {
  done: boolean;
}

export interface AgePlanEntry {
  id: string;
  year: number;
  age: number;
  happened: AgePlanNote[];
  plans: PlanItem[];
}
