import { Incident, User } from "../../api";
import { buttonBase, buttonCard } from "../utils/incidentStyles";
import {
  formatDate,
  getAssigneeName,
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from "../utils/incidentUtils";

type IncidentQueueProps = {
  filteredIncidents: Incident[];
  incidentsCount: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  users: User[];
  onRefresh: () => void;
  onSelect: (id: string) => void;
};

export function IncidentQueue({
  filteredIncidents,
  incidentsCount,
  loading,
  error,
  selectedId,
  users,
  onRefresh,
  onSelect,
}: IncidentQueueProps) {
  return (
    <div className="animate-panel rounded-none bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Incident queue</h2>
          <p className="text-sm">
            Showing {filteredIncidents.length} of {incidentsCount} alerts
          </p>
        </div>
        <button
          className={`${buttonBase} ${buttonCard} flex items-center justify-center gap-2`}
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? <span className="spinner" aria-hidden="true" /> : null}
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 rounded-none bg-white p-4 text-sm" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Loading incidents...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3 rounded-none border border-rose-200 bg-white p-4 text-sm text-rose-700" role="alert">
            <p>{error}</p>
            <button className={`${buttonBase} ${buttonCard}`} type="button" onClick={onRefresh}>
              Retry
            </button>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="rounded-none bg-white p-4 text-sm">
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
                    className={`animate-card w-full rounded-none border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60 ${
                      isSelected
                        ? "border-accent bg-white"
                        : "border-transparent bg-white"
                    }`}
                    onClick={() => onSelect(incident.id)}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-extrabold">
                          {incident.title}
                        </h3>
                        <p className="text-xs">
                          {formatDate(incident.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] ${getStatusBadgeClass(
                            incident.status,
                          )}`}
                        >
                          {incident.status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] ${getSeverityBadgeClass(
                            incident.severity,
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
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
  );
}
