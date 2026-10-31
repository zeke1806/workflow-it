import { afterEach, beforeEach, vi } from "vitest";
import { syncBuiltinESMExports } from "node:module";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(forbidden);
  vi.spyOn(http, "request").mockImplementation(forbidden);
  vi.spyOn(http, "get").mockImplementation(forbidden);
  vi.spyOn(https, "request").mockImplementation(forbidden);
  vi.spyOn(https, "get").mockImplementation(forbidden);
  vi.spyOn(net.Socket.prototype, "connect").mockImplementation(forbidden);
  vi.spyOn(net.Server.prototype, "listen").mockImplementation(forbidden);
  vi.spyOn(process, "dlopen").mockImplementation(forbidden);

  for (const method of [
    "writeFileSync",
    "appendFileSync",
    "mkdtempSync",
    "mkdirSync",
    "rmSync",
    "unlinkSync",
    "openSync",
  ] as const) {
    vi.spyOn(fs, method).mockImplementation(forbidden);
  }

  for (const method of [
    "writeFile",
    "appendFile",
    "mkdtemp",
    "mkdir",
    "rm",
    "unlink",
    "open",
  ] as const) {
    vi.spyOn(fsPromises, method).mockImplementation(forbidden);
  }

  syncBuiltinESMExports();
});

afterEach(() => {
  vi.restoreAllMocks();
  syncBuiltinESMExports();
});

function forbidden(): never {
  throw new Error("External effect forbidden in isolated tests; inject an in-memory boundary.");
}
