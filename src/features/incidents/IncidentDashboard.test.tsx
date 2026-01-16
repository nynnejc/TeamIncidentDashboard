import { render, screen, fireEvent, within } from "@testing-library/react";
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

  it("sorts incidents by severity (high to low)", async () => {
    render(<IncidentDashboard />);

    await screen.findByText("Database connection timeout");

    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: "severity-desc" },
    });

    const list = screen.getByRole("list", { name: "Incident list" });
    const cards = within(list).getAllByRole("button");

    expect(cards[0]).toHaveTextContent("Payment gateway error");
  });

  it("enables save when status changes in detail panel", async () => {
    render(<IncidentDashboard />);

    const incidentCard = await screen.findByRole("button", {
      name: /Database connection timeout/i,
    });

    fireEvent.click(incidentCard);

    const saveButton = await screen.findByRole("button", {
      name: "Save changes",
    });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "Resolved" },
    });

    expect(saveButton).toBeEnabled();
  });
});
