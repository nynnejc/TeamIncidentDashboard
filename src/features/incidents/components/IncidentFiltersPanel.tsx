import { IncidentStatus, User } from "../../api";
import { severityOptions, sortOptions, statusOptions } from "../utils/incidentConstants";
import { Filters, SortKey } from "../utils/incidentTypes";
import { buttonBase, buttonBlue, fieldBase } from "../utils/incidentStyles";

type IncidentFiltersPanelProps = {
  filters: Filters;
  users: User[];
  onChange: (next: Filters) => void;
  onReset: () => void;
};

export function IncidentFiltersPanel({
  filters,
  users,
  onChange,
  onReset,
}: IncidentFiltersPanelProps) {
  return (
    <aside className="animate-panel rounded-none bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-lg font-bold text-danskeblue">Filters</h2>
      <div className="flex flex-col gap-4 text-sm text-danskeblue">
        <label className="flex flex-col gap-1.5">
          <span>Search by title</span>
          <input
            className={fieldBase}
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
              })
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
              onChange({
                ...filters,
                status: event.target.value as IncidentStatus | "",
              })
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
              onChange({
                ...filters,
                severity: event.target.value,
              })
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
              onChange({
                ...filters,
                assigneeId: event.target.value,
              })
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
              onChange({
                ...filters,
                sortBy: event.target.value as SortKey,
              })
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button className={`${buttonBase} ${buttonBlue}`} type="button" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </aside>
  );
}
