import { useEffect, useState } from "react";
import {
  Incident,
  IncidentStatus,
  UpdateIncidentInput,
  User,
} from "../../api";
import { statusOptions } from "../utils/incidentConstants";
import { buttonBase, buttonBlue, fieldBase } from "../utils/incidentStyles";
import { formatDate } from "../utils/incidentUtils";

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

export function IncidentDetailPanel({
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
          <h2 className="text-lg font-extrabold text-danskeblue">
            Incident detail
          </h2>
          <p className="text-xs text-danskeblue">
            Updates flow to the live queue.
          </p>
        </div>
        <button
          className={`${buttonBase} ${buttonBlue} px-3 py-2`}
          type="button"
          onClick={onClose}
          disabled={!incident && !loading}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="rounded-none bg-white p-4 text-sm text-danskeblue" role="status" aria-live="polite">
          Loading incident details...
        </div>
      ) : error ? (
        <div className="rounded-none border border-rose-200 bg-white p-4 text-sm text-rose-700" role="alert">
          {error}
        </div>
      ) : !incident ? (
        <div className="rounded-none bg-white p-4 text-sm text-danskeblue">
          Select an incident to see full details and update status.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-none bg-white p-4">
            <div>
              <h3 className="text-base font-extrabold text-danskeblue">
                {incident.title}
              </h3>
              <p className="mt-2 text-sm text-danskeblue">
                {incident.description}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-danskeblue">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-danskeblue">
                  Created
                </p>
                <p className="text-sm text-danskeblue">
                  {formatDate(incident.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-danskeblue">
                  Last update
                </p>
                <p className="text-sm text-danskeblue">
                  {formatDate(incident.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-danskeblue">
                  Severity
                </p>
                <p className="text-sm text-danskeblue">
                  {incident.severity}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.1em] text-danskeblue">
                  Current status
                </p>
                <p className="text-sm text-danskeblue">
                  {incident.status}
                </p>
              </div>
            </div>
          </div>

          <form
            className="rounded-none bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!incident || !isDirty) return;
              onSave(incident.id, {
                status,
                assigneeId: assigneeId ? assigneeId : null,
              });
            }}
          >
            <h4 className="text-sm font-extrabold text-danskeblue">
              Update ownership
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-danskeblue">
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

              <label className="flex flex-col gap-1.5 text-sm text-danskeblue">
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
              <p className="mt-3 rounded-none bg-white p-3 text-sm text-rose-700" role="alert">
                {saveError}
              </p>
            ) : null}

            <button
              className={`${buttonBase} ${buttonBlue} mt-4 w-full`}
              type="submit"
              disabled={!isDirty || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <div className="rounded-none bg-white p-4">
            <h4 className="text-sm font-extrabold text-danskeblue">
              Status history
            </h4>
            <ul className="mt-3 flex flex-col gap-2 text-xs text-danskeblue">
              {incident.statusHistory.map((entry) => (
                <li
                  key={`${entry.status}-${entry.changedAt}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-none bg-white p-3"
                >
                  <span className="text-xs font-extrabold text-danskeblue">
                    {entry.status}
                  </span>
                  <span>{formatDate(entry.changedAt)}</span>
                  <span className="text-[0.7rem] text-danskeblue">
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
