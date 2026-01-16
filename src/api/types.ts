export type IncidentStatus = "Open" | "In Progress" | "Resolved";
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StatusHistoryEntry {
  status: IncidentStatus;
  changedAt: string;
  changedBy: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  severity: IncidentSeverity;
  assigneeId: string | null;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  assigneeId?: string | null;
}
