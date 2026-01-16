import { buttonBase, buttonBlue } from "../utils/incidentStyles";

type IncidentHeaderProps = {
  onNewIncident: () => void;
};

export function IncidentHeader({ onNewIncident }: IncidentHeaderProps) {
  return (
    <header className="flex flex-row gap-6 rounded-none bg-danskeblue p-16 shadow-soft lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white">
          Operations Control
        </p>
        <h1 className="font-serif text-3xl text-white font-extrabold sm:text-4xl">
          Team Incident Dashboard
        </h1>
        <p className="max-w-xl text-sm text-white sm:text-base">
          Track service health, assign owners, and close incidents with
          confidence.
        </p>
      </div>
      <button className={`${buttonBase} ${buttonBlue}`} type="button" onClick={onNewIncident}>
        New incident
      </button>
    </header>
  );
}
