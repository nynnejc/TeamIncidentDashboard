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
    return "bg-white text-green-500";
  }
  if (status === "In Progress") {
    return "bg-white text-violet-600";
  }
  return "bg-white text-blue-600";
}

export function getSeverityBadgeClass(severity: IncidentSeverity): string {
  if (severity === "Critical") {
    return "bg-white text-red-500";
  }
  if (severity === "High") {
    return "bg-white text-orange-500";
  }
  if (severity === "Medium") {
    return "bg-white text-yellow-600";
  }
  return "bg-white text-pink-400";
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
