import type { Incident, User } from "./types";

export const defaultUsers: User[] = [
  { id: "user-1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "user-2", name: "Bob Smith", email: "bob@example.com" },
  { id: "user-3", name: "Carol Williams", email: "carol@example.com" },
  { id: "user-4", name: "David Brown", email: "david@example.com" },
];

export const defaultIncidents: Incident[] = [
  {
    id: "inc-1",
    title: "Database connection timeout",
    description:
      "The main database is experiencing intermittent connection timeouts affecting user authentication.",
    status: "Open",
    severity: "High",
    assigneeId: "user-1",
    createdAt: "2026-01-08T10:30:00Z",
    updatedAt: "2026-01-08T10:30:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-08T10:30:00Z",
        changedBy: "user-2",
      },
    ],
  },
  {
    id: "inc-2",
    title: "Payment gateway error",
    description:
      "Users are receiving 500 errors when attempting to complete checkout.",
    status: "In Progress",
    severity: "Critical",
    assigneeId: "user-2",
    createdAt: "2026-01-07T14:00:00Z",
    updatedAt: "2026-01-08T09:15:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-07T14:00:00Z",
        changedBy: "user-3",
      },
      {
        status: "In Progress",
        changedAt: "2026-01-08T09:15:00Z",
        changedBy: "user-2",
      },
    ],
  },
  {
    id: "inc-3",
    title: "Login page CSS broken on mobile",
    description:
      "The login button is not visible on mobile devices due to a CSS issue.",
    status: "Resolved",
    severity: "Medium",
    assigneeId: "user-3",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-06T11:30:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-05T08:00:00Z",
        changedBy: "user-1",
      },
      {
        status: "In Progress",
        changedAt: "2026-01-05T10:00:00Z",
        changedBy: "user-3",
      },
      {
        status: "Resolved",
        changedAt: "2026-01-06T11:30:00Z",
        changedBy: "user-3",
      },
    ],
  },
  {
    id: "inc-4",
    title: "Email notifications delayed",
    description:
      "Order confirmation emails are being sent with a 2-hour delay.",
    status: "Open",
    severity: "Low",
    assigneeId: null,
    createdAt: "2026-01-09T07:00:00Z",
    updatedAt: "2026-01-09T07:00:00Z",
    statusHistory: [
      {
        status: "Open",
        changedAt: "2026-01-09T07:00:00Z",
        changedBy: "user-4",
      },
    ],
  },
];
