import { useEffect, useMemo, useState } from "react";
import {
  CreateIncidentInput,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  UpdateIncidentInput,
  User,
} from "../../api";

type SortKey = "created-desc" | "created-asc" | "severity-desc" | "status";

type Filters = {
  search: string;
  status: IncidentStatus | "";
  severity: IncidentSeverity | "";
  assigneeId: string;
  sortBy: SortKey;
};

const statusOptions: IncidentStatus[] = ["Open", "In Progress", "Resolved"];
const severityOptions: IncidentSeverity[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const statusOrder: Record<IncidentStatus, number> = {
  Open: 1,
  "In Progress": 2,
  Resolved: 3,
};

const severityOrder: Record<IncidentSeverity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "created-desc", label: "Created: newest" },
  { value: "created-asc", label: "Created: oldest" },
  { value: "severity-desc", label: "Severity: high to low" },
  { value: "status", label: "Status: open to resolved" },
];

const buttonBase =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
const buttonPrimary =
  "bg-accent text-white shadow-[0_12px_24px_rgba(8,78,123,0.25)] hover:-translate-y-0.5 hover:shadow-lift disabled:shadow-none motion-reduce:hover:translate-y-0";
const buttonSecondary =
  "border border-border bg-white text-ink-strong hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0";
const buttonGhost = "text-ink-strong hover:bg-surface-muted";

const fieldBase =
  "rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getAssigneeName(users: User[], assigneeId: string | null): string {
  if (!assigneeId) return "Unassigned";
  return users.find((user) => user.id === assigneeId)?.name ?? "Unknown";
}

function getStatusBadgeClass(status: IncidentStatus): string {
  if (status === "Resolved") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "In Progress") {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-accent-light text-accent";
}

function getSeverityBadgeClass(severity: IncidentSeverity): string {
  if (severity === "Critical") {
    return "bg-purple-100 text-purple-700";
  }
  if (severity === "High") {
    return "bg-rose-100 text-rose-700";
  }
  if (severity === "Medium") {
    return "bg-orange-100 text-orange-700";
  }
  return "bg-blue-100 text-blue-700";
}

async function parseError(response: Response): Promise<string> {
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

export function IncidentDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    severity: "",
    assigneeId: "",
    sortBy: "created-desc",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Incident | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createState, setCreateState] = useState({
    saving: false,
    error: null as string | null,
  });
  const [updateState, setUpdateState] = useState({
    saving: false,
    error: null as string | null,
  });

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incidentsResponse, usersResponse] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/users"),
      ]);

      if (!incidentsResponse.ok) {
        throw new Error(await parseError(incidentsResponse));
      }
      if (!usersResponse.ok) {
        throw new Error(await parseError(usersResponse));
      }

      const incidentsData = (await incidentsResponse.json()) as Incident[];
      const usersData = (await usersResponse.json()) as User[];
      setIncidents(incidentsData);
      setUsers(usersData);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unable to load incidents.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    let ignore = false;

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      const existing = incidents.find((incident) => incident.id === selectedId);
      if (existing) {
        setDetail(existing);
      }

      try {
        const response = await fetch(`/api/incidents/${selectedId}`);
        if (!response.ok) {
          throw new Error(await parseError(response));
        }
        const data = (await response.json()) as Incident;
        if (!ignore) {
          setDetail(data);
        }
      } catch (detailLoadError) {
        if (!ignore) {
          const message =
            detailLoadError instanceof Error
              ? detailLoadError.message
              : "Unable to load incident details.";
          setDetailError(message);
        }
      } finally {
        if (!ignore) {
          setDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [selectedId, incidents]);

  const filteredIncidents = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    const filtered = incidents.filter((incident) => {
      if (
        searchTerm &&
        !incident.title.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
      if (filters.status && incident.status !== filters.status) {
        return false;
      }
      if (filters.severity && incident.severity !== filters.severity) {
        return false;
      }
      if (filters.assigneeId) {
        if (filters.assigneeId === "unassigned") {
          if (incident.assigneeId !== null) {
            return false;
          }
        } else {
          const incidentAssignee = incident.assigneeId ?? "";
          if (incidentAssignee !== filters.assigneeId) {
            return false;
          }
        }
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (filters.sortBy === "created-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === "created-asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === "severity-desc") {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return sorted;
  }, [filters, incidents]);

  const handleCreate = async (input: CreateIncidentInput) => {
    setCreateState({ saving: true, error: null });
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const created = (await response.json()) as Incident;
      setIncidents((prev) => [created, ...prev]);
      setCreateOpen(false);
      setSelectedId(created.id);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create incident.";
      setCreateState({ saving: false, error: message });
      return;
    }

    setCreateState({ saving: false, error: null });
  };

  const handleUpdate = async (id: string, input: UpdateIncidentInput) => {
    setUpdateState({ saving: true, error: null });

    const previousIncidents = incidents;
    const previousDetail = detail;

    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id ? { ...incident, ...input } : incident,
      ),
    );
    if (detail && detail.id === id) {
      setDetail({ ...detail, ...input });
    }

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const updated = (await response.json()) as Incident;
      setIncidents((prev) =>
        prev.map((incident) => (incident.id === id ? updated : incident)),
      );
      setDetail(updated);
      setUpdateState({ saving: false, error: null });
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Unable to update incident.";
      setIncidents(previousIncidents);
      setDetail(previousDetail);
      setUpdateState({ saving: false, error: message });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6 rounded-[28px] bg-surface p-6 shadow-soft lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">
            Operations Control
          </p>
          <h1 className="font-serif text-3xl font-semibold text-ink-strong sm:text-4xl">
            Team Incident Dashboard
          </h1>
          <p className="max-w-xl text-sm text-ink-muted sm:text-base">
            Track service health, assign owners, and close incidents with
            confidence.
          </p>
        </div>
        <button
          className={`${buttonBase} ${buttonPrimary}`}
          type="button"
          onClick={() => {
            setCreateState({ saving: false, error: null });
            setCreateOpen(true);
          }}
        >
          New incident
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_minmax(360px,1fr)_minmax(280px,360px)]">
        <aside className="animate-panel rounded-3xl bg-surface p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-ink-strong">Filters</h2>
          <div className="flex flex-col gap-4 text-sm text-ink-muted">
            <label className="flex flex-col gap-1.5">
              <span>Search by title</span>
              <input
                className={fieldBase}
                type="search"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
                placeholder="Database timeout"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span>Status</span>
              <select
                className={fieldBase}
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value as IncidentStatus | "",
                  }))
                }
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span>Severity</span>
              <select
                className={fieldBase}
                value={filters.severity}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    severity: event.target.value as IncidentSeverity | "",
                  }))
                }
              >
                <option value="">All severities</option>
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span>Assignee</span>
              <select
                className={fieldBase}
                value={filters.assigneeId}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    assigneeId: event.target.value,
                  }))
                }
              >
                <option value="">Anyone</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span>Sort by</span>
              <select
                className={fieldBase}
                value={filters.sortBy}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: event.target.value as SortKey,
                  }))
                }
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              className={`${buttonBase} ${buttonGhost}`}
              type="button"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  severity: "",
                  assigneeId: "",
                  sortBy: "created-desc",
                })
              }
            >
              Reset filters
            </button>
          </div>
        </aside>

        <div className="animate-panel rounded-3xl bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-strong">
                Incident queue
              </h2>
              <p className="text-sm text-ink-muted">
                Showing {filteredIncidents.length} of {incidents.length} alerts
              </p>
            </div>
            <button
              className={`${buttonBase} ${buttonSecondary}`}
              type="button"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted" role="status" aria-live="polite">
                Loading incidents...
              </div>
            ) : error ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
                <p>{error}</p>
                <button
                  className={`${buttonBase} ${buttonSecondary}`}
                  type="button"
                  onClick={loadDashboard}
                >
                  Retry
                </button>
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted">
                No incidents match your filters.
              </div>
            ) : (
              <ul className="mt-2 flex flex-col gap-4" aria-label="Incident list">
                {filteredIncidents.map((incident) => {
                  const isSelected = incident.id === selectedId;
                  return (
                    <li key={incident.id}>
                      <button
                        type="button"
                        className={`animate-card w-full rounded-2xl border p-4 text-left shadow-[0_12px_30px_rgba(9,32,56,0.08)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                          isSelected
                            ? "border-accent bg-white"
                            : "border-transparent bg-surface-muted"
                        }`}
                        onClick={() => setSelectedId(incident.id)}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-ink-strong">
                              {incident.title}
                            </h3>
                            <p className="text-xs text-ink-muted">
                              {formatDate(incident.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${getStatusBadgeClass(
                                incident.status,
                              )}`}
                            >
                              {incident.status}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${getSeverityBadgeClass(
                                incident.severity,
                              )}`}
                            >
                              {incident.severity}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Assignee: {getAssigneeName(users, incident.assigneeId)}
                          </span>
                          <span>Updated {formatDate(incident.updatedAt)}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <aside className="animate-panel rounded-3xl bg-surface p-6 shadow-soft">
          <IncidentDetailPanel
            incident={detail}
            users={users}
            loading={detailLoading}
            error={detailError}
            saving={updateState.saving}
            saveError={updateState.error}
            onSave={handleUpdate}
            onClose={() => setSelectedId(null)}
          />
        </aside>
      </section>

      {createOpen ? (
        <CreateIncidentModal
          users={users}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          saving={createState.saving}
          error={createState.error}
        />
      ) : null}
    </div>
  );
}

type DetailProps = {
  incident: Incident | null;
  users: User[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  onSave: (id: string, input: UpdateIncidentInput) => void;
  onClose: () => void;
};

function IncidentDetailPanel({
  incident,
  users,
  loading,
  error,
  saving,
  saveError,
  onSave,
  onClose,
}: DetailProps) {
  const [status, setStatus] = useState<IncidentStatus>("Open");
  const [assigneeId, setAssigneeId] = useState<string>("");

  useEffect(() => {
    if (incident) {
      setStatus(incident.status);
      setAssigneeId(incident.assigneeId ?? "");
    }
  }, [incident]);

  const isDirty =
    !!incident &&
    (status !== incident.status ||
      assigneeId !== (incident.assigneeId ?? ""));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink-strong">
            Incident detail
          </h2>
          <p className="text-xs text-ink-muted">
            Updates flow to the live queue.
          </p>
        </div>
        <button
          className={`${buttonBase} ${buttonGhost} px-3 py-2`}
          type="button"
          onClick={onClose}
          disabled={!incident && !loading}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted" role="status" aria-live="polite">
          Loading incident details...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {error}
        </div>
      ) : !incident ? (
        <div className="rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted">
          Select an incident to see full details and update status.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-surface-muted p-4">
            <div>
              <h3 className="text-base font-semibold text-ink-strong">
                {incident.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                {incident.description}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-muted">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">
                  Created
                </p>
                <p className="text-sm text-ink-strong">
                  {formatDate(incident.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">
                  Last update
                </p>
                <p className="text-sm text-ink-strong">
                  {formatDate(incident.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">
                  Severity
                </p>
                <p className="text-sm text-ink-strong">
                  {incident.severity}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">
                  Current status
                </p>
                <p className="text-sm text-ink-strong">
                  {incident.status}
                </p>
              </div>
            </div>
          </div>

          <form
            className="rounded-2xl bg-surface-muted p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!incident || !isDirty) return;
              onSave(incident.id, {
                status,
                assigneeId: assigneeId ? assigneeId : null,
              });
            }}
          >
            <h4 className="text-sm font-semibold text-ink-strong">
              Update ownership
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
                <span>Status</span>
                <select
                  className={fieldBase}
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as IncidentStatus)
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
                <span>Assignee</span>
                <select
                  className={fieldBase}
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {saveError ? (
              <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
                {saveError}
              </p>
            ) : null}

            <button
              className={`${buttonBase} ${buttonPrimary} mt-4 w-full`}
              type="submit"
              disabled={!isDirty || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <div className="rounded-2xl bg-surface-muted p-4">
            <h4 className="text-sm font-semibold text-ink-strong">
              Status history
            </h4>
            <ul className="mt-3 flex flex-col gap-2 text-xs text-ink-muted">
              {incident.statusHistory.map((entry) => (
                <li
                  key={`${entry.status}-${entry.changedAt}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-white p-3"
                >
                  <span className="text-xs font-semibold text-ink-strong">
                    {entry.status}
                  </span>
                  <span>{formatDate(entry.changedAt)}</span>
                  <span className="text-[0.7rem] text-ink-muted">
                    {users.find((user) => user.id === entry.changedBy)?.name ??
                      entry.changedBy}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

type CreateModalProps = {
  users: User[];
  onClose: () => void;
  onSubmit: (input: CreateIncidentInput) => void;
  saving: boolean;
  error: string | null;
};

function CreateIncidentModal({
  users,
  onClose,
  onSubmit,
  saving,
  error,
}: CreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("Low");
  const [assigneeId, setAssigneeId] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const validate = () => {
    const nextErrors: string[] = [];
    if (!title.trim()) {
      nextErrors.push("Title is required.");
    }
    if (!severity) {
      nextErrors.push("Severity is required.");
    }
    setFormErrors(nextErrors);
    return nextErrors.length === 0;
  };

  return (
    <div className="fixed inset-0 z-20 grid place-items-center">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[min(720px,92vw)] rounded-3xl bg-white p-8 shadow-[0_30px_80px_rgba(10,24,40,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-strong">
              New incident
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Capture a crisp summary and assign an owner.
            </p>
          </div>
          <button
            className={`${buttonBase} ${buttonGhost} px-3 py-2`}
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validate()) return;
            onSubmit({
              title: title.trim(),
              description: description.trim(),
              severity,
              assigneeId: assigneeId ? assigneeId : null,
            });
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
            <span>Title</span>
            <input
              className={fieldBase}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Describe the issue"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
            <span>Description</span>
            <textarea
              className={fieldBase}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add customer impact and next steps"
              rows={4}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
              <span>Severity</span>
              <select
                className={fieldBase}
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as IncidentSeverity)
                }
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
              <span>Assignee</span>
              <select
                className={fieldBase}
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formErrors.length > 0 ? (
            <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {formErrors.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className={`${buttonBase} ${buttonGhost}`}
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className={`${buttonBase} ${buttonPrimary}`}
              type="submit"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
