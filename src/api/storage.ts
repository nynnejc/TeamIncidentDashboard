import type { Incident, User } from "./types";
import { defaultIncidents, defaultUsers } from "./seedData";

const STORAGE_KEY_INCIDENTS = "incidents";
const STORAGE_KEY_USERS = "users";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
}

export function getIncidents(): Incident[] {
  return loadFromStorage(STORAGE_KEY_INCIDENTS, defaultIncidents);
}

export function setIncidents(incidents: Incident[]): void {
  saveToStorage(STORAGE_KEY_INCIDENTS, incidents);
}

export function getUsers(): User[] {
  return loadFromStorage(STORAGE_KEY_USERS, defaultUsers);
}

export function setUsers(users: User[]): void {
  saveToStorage(STORAGE_KEY_USERS, users);
}

export function resetData(): void {
  setIncidents(defaultIncidents);
  setUsers(defaultUsers);
}
