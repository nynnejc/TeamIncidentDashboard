import type {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
} from "./types";
import { getIncidents, setIncidents, getUsers, resetData } from "./storage";

// Simulated network delay (ms) - set to 0 in test environment
const SIMULATED_DELAY =
  typeof process !== "undefined" && process.env?.NODE_ENV === "test" ? 0 : 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type RouteHandler = (
  params: Record<string, string>,
  request: Request,
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

const routes: Route[] = [
  // GET /api/incidents
  {
    method: "GET",
    pattern: /^\/api\/incidents$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      return jsonResponse(getIncidents());
    },
  },

  // GET /api/incidents/:id
  {
    method: "GET",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const incident = incidents.find((inc) => inc.id === params.id);
      if (!incident) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }
      return jsonResponse(incident);
    },
  },

  // POST /api/incidents
  {
    method: "POST",
    pattern: /^\/api\/incidents$/,
    handler: async (_params, request) => {
      await delay(SIMULATED_DELAY);
      const input: CreateIncidentInput = await request.json();

      if (!input.title?.trim()) {
        return errorResponse("Title is required", 400);
      }
      if (!input.severity) {
        return errorResponse("Severity is required", 400);
      }

      const now = new Date().toISOString();
      const newIncident: Incident = {
        id: generateId(),
        title: input.title.trim(),
        description: input.description || "",
        status: "Open",
        severity: input.severity,
        assigneeId: input.assigneeId || null,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: "Open",
            changedAt: now,
            changedBy: "current-user",
          },
        ],
      };

      const incidents = getIncidents();
      incidents.unshift(newIncident);
      setIncidents(incidents);

      return jsonResponse(newIncident, 201);
    },
  },

  // PATCH /api/incidents/:id
  {
    method: "PATCH",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params, request) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const index = incidents.findIndex((inc) => inc.id === params.id);

      if (index === -1) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }

      const input: UpdateIncidentInput = await request.json();
      const existing = incidents[index];
      const now = new Date().toISOString();

      // Track status change in history
      let statusHistory = existing.statusHistory;
      if (input.status && input.status !== existing.status) {
        statusHistory = [
          ...statusHistory,
          {
            status: input.status,
            changedAt: now,
            changedBy: "current-user",
          },
        ];
      }

      const updated: Incident = {
        ...existing,
        ...input,
        updatedAt: now,
        statusHistory,
      };

      incidents[index] = updated;
      setIncidents(incidents);

      return jsonResponse(updated);
    },
  },

  // DELETE /api/incidents/:id
  {
    method: "DELETE",
    pattern: /^\/api\/incidents\/([^/]+)$/,
    handler: async (params) => {
      await delay(SIMULATED_DELAY);
      const incidents = getIncidents();
      const index = incidents.findIndex((inc) => inc.id === params.id);

      if (index === -1) {
        return errorResponse(`Incident with id "${params.id}" not found`, 404);
      }

      incidents.splice(index, 1);
      setIncidents(incidents);

      return new Response(null, { status: 204 });
    },
  },

  // GET /api/users
  {
    method: "GET",
    pattern: /^\/api\/users$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      return jsonResponse(getUsers());
    },
  },

  // POST /api/reset - Reset data to defaults (for testing)
  {
    method: "POST",
    pattern: /^\/api\/reset$/,
    handler: async () => {
      await delay(SIMULATED_DELAY);
      resetData();
      return jsonResponse({ message: "Data reset to defaults" });
    },
  },
];

function matchRoute(
  method: string,
  pathname: string,
): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;

    const match = pathname.match(route.pattern);
    if (match) {
      // Extract named params (for now, just 'id' from capture group)
      const params: Record<string, string> = {};
      if (match[1]) {
        params.id = match[1];
      }
      return { route, params };
    }
  }
  return null;
}

async function handleMockRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  // Only intercept /api/* requests
  if (!url.pathname.startsWith("/api/")) {
    return null;
  }

  const matched = matchRoute(request.method, url.pathname);

  if (!matched) {
    return errorResponse(
      `No route found for ${request.method} ${url.pathname}`,
      404,
    );
  }

  try {
    return await matched.route.handler(matched.params, request);
  } catch (error) {
    console.error("Mock API error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Store the original fetch
const originalFetch = globalThis.fetch?.bind(globalThis);

// Mock fetch that intercepts /api/* requests
async function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // Handle relative URLs by adding a base URL (needed for Node.js/test environments)
  let url: string;
  if (typeof input === "string") {
    url = input.startsWith("/") ? `http://localhost${input}` : input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  const request = new Request(url, init);
  const mockResponse = await handleMockRequest(request);

  if (mockResponse) {
    return mockResponse;
  }

  // Pass through to original fetch for non-API requests
  if (originalFetch) {
    return originalFetch(input, init);
  }
  throw new Error("No fetch implementation available");
}

/**
 * Initialize the mock API by replacing global fetch
 */
export function initMockApi(): void {
  globalThis.fetch = mockFetch;
  console.log("🔧 Mock API initialized - intercepting /api/* requests");
}

/**
 * Restore the original fetch (useful for testing)
 */
export function teardownMockApi(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
  console.log("🔧 Mock API torn down - original fetch restored");
}
