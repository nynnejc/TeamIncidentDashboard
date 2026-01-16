import { buttonBase, buttonBlue } from "../utils/incidentStyles";

type IncidentHeaderProps = {
  onNewIncident: () => void;
};

export function IncidentHeader({ onNewIncident }: IncidentHeaderProps) {
  return (
    <header className="flex h-full w-full flex-col gap-6 rounded-none bg-[#002346] p-10 lg:h-56 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-white font-extrabold sm:text-4xl">
            Team Incident Dashboard
          </h1>
          <p className="max-w-xl text-sm text-white sm:text-base">
            Track service health, assign owners, and close incidents with
            confidence.
          </p>
        </div>
        <button className={`${buttonBase} ${buttonBlue} self-start`} type="button" onClick={onNewIncident}>
          New incident
        </button>
      </div>
    </header>
  );
}
