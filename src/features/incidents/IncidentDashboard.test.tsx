import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IncidentDashboard } from "./IncidentDashboard";

describe("IncidentDashboard", () => {
  it("loads and displays incidents", async () => {
    render(<IncidentDashboard />);

    expect(
      await screen.findByText("Database connection timeout"),
    ).toBeInTheDocument();
    expect(screen.getByText("Payment gateway error")).toBeInTheDocument();
  });

  it("filters incidents by status", async () => {
    render(<IncidentDashboard />);

    await screen.findByText("Database connection timeout");

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "Resolved" },
    });

    expect(
      screen.getByText("Login page CSS broken on mobile"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Payment gateway error")).toBeNull();
  });

  it("validates the create incident form", async () => {
    render(<IncidentDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "New incident" }));

    fireEvent.click(
      await screen.findByRole("button", { name: "Create incident" }),
    );

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
  });
});
