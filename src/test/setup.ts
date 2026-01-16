import "@testing-library/jest-dom";
import { beforeEach } from "vitest";
import { initMockApi } from "../api";
import { resetData } from "../api/storage";

initMockApi();

beforeEach(() => {
  resetData();
});
