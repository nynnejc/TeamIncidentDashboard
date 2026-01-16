import { IncidentSeverity, IncidentStatus } from "../../api";

export type SortKey = "created-desc" | "created-asc" | "severity-desc" | "status";

export type Filters = {
  search: string;
  status: IncidentStatus | "";
  severity: IncidentSeverity | "";
  assigneeId: string;
  sortBy: SortKey;
};
