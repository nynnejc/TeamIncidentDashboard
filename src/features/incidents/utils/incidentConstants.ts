import { IncidentSeverity, IncidentStatus } from "../../api";
import { SortKey } from "./incidentTypes";

export const statusOptions: IncidentStatus[] = ["Open", "In Progress", "Resolved"];
export const severityOptions: IncidentSeverity[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const statusOrder: Record<IncidentStatus, number> = {
  Open: 1,
  "In Progress": 2,
  Resolved: 3,
};

export const severityOrder: Record<IncidentSeverity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "created-desc", label: "Created: newest" },
  { value: "created-asc", label: "Created: oldest" },
  { value: "severity-desc", label: "Severity: high to low" },
  { value: "status", label: "Status: open to resolved" },
];
