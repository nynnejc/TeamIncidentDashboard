import { useEffect, useMemo, useState } from "react";
import { CreateIncidentInput, Incident, UpdateIncidentInput, User } from "../../api";
import { CreateIncidentModal } from "./components/CreateIncidentModal";
import { IncidentDetailPanel } from "./components/IncidentDetailPanel";
import { IncidentFiltersPanel } from "./components/IncidentFiltersPanel";
import { IncidentHeader } from "./components/IncidentHeader";
import { IncidentQueue } from "./components/IncidentQueue";
import { severityOrder, statusOrder } from "./utils/incidentConstants";
import { Filters } from "./utils/incidentTypes";
import { parseError } from "./utils/incidentUtils";

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
      <IncidentHeader
        onNewIncident={() => {
          setCreateState({ saving: false, error: null });
          setCreateOpen(true);
        }}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(240px,280px)_minmax(360px,1fr)_minmax(280px,360px)]">
        <IncidentFiltersPanel
          filters={filters}
          users={users}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              search: "",
              status: "",
              severity: "",
              assigneeId: "",
              sortBy: "created-desc",
            })
          }
        />

        <IncidentQueue
          filteredIncidents={filteredIncidents}
          incidentsCount={incidents.length}
          loading={loading}
          error={error}
          selectedId={selectedId}
          users={users}
          onRefresh={loadDashboard}
          onSelect={(id) => setSelectedId(id)}
        />

        <aside className="animate-panel rounded-none bg-white p-6 shadow-soft">
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
