import { IncidentSeverity, IncidentStatus, User } from "../../api";

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getAssigneeName(users: User[], assigneeId: string | null): string {
  if (!assigneeId) return "Unassigned";
  return users.find((user) => user.id === assigneeId)?.name ?? "Unknown";
}

export function getStatusBadgeClass(status: IncidentStatus): string {
  if (status === "Resolved") {
    return "bg-white text-emerald-700";
  }
  if (status === "In Progress") {
    return "bg-white text-amber-700";
  }
  return "bg-white text-accent";
}

export function getSeverityBadgeClass(severity: IncidentSeverity): string {
  if (severity === "Critical") {
    return "bg-white text-purple-700";
  }
  if (severity === "High") {
    return "bg-white text-rose-700";
  }
  if (severity === "Medium") {
    return "bg-white text-orange-700";
  }
  return "bg-white text-blue-700";
}

export async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) {
      return data.error;
    }
  } catch {
    // Ignore parsing errors.
  }
  return `Request failed (${response.status})`;
}
