import { useEffect, useRef, useState } from "react";
import { CreateIncidentInput, IncidentSeverity, User } from "../../api";
import { severityOptions } from "../utils/incidentConstants";
import { buttonBase, buttonBlue, buttonCard, fieldBase } from "../utils/incidentStyles";

type CreateModalProps = {
  users: User[];
  onClose: () => void;
  onSubmit: (input: CreateIncidentInput) => void;
  saving: boolean;
  error: string | null;
};

export function CreateIncidentModal({
  users,
  onClose,
  onSubmit,
  saving,
  error,
}: CreateModalProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

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
        className="absolute inset-0 bg-white backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-[min(720px,92vw)] rounded-none bg-white p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-incident-title"
        aria-describedby="create-incident-description"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold" id="create-incident-title">
              New incident
            </h2>
            <p className="mt-1 text-sm" id="create-incident-description">
              Capture a crisp summary and assign an owner.
            </p>
          </div>
          <button
            className={`${buttonBase} ${buttonCard} px-3 py-2`}
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
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Title</span>
            <input
              className={fieldBase}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Describe the issue"
              ref={titleInputRef}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
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
            <label className="flex flex-col gap-1.5 text-sm">
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

            <label className="flex flex-col gap-1.5 text-sm">
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
            <div className="rounded-none bg-white p-3 text-sm text-rose-700" role="alert">
              {formErrors.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-none bg-white p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className={`${buttonBase} ${buttonCard}`}
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className={`${buttonBase} ${buttonBlue} flex items-center justify-center gap-2`}
              type="submit"
              disabled={saving}
            >
              {saving ? <span className="spinner" aria-hidden="true" /> : null}
              <span>{saving ? "Creating..." : "Create incident"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
