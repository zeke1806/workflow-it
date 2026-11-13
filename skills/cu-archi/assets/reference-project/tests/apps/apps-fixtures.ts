import { IncomingMessage, ServerResponse } from "node:http";
import { PassThrough } from "node:stream";
import type { Socket } from "node:net";
import assert from "node:assert/strict";
import type { AppError } from "@cu-archi/core/errors";
import { createApp } from "../../apps/api/src/app.js";
import { createDependencies } from "../../apps/api/src/services/di.js";
import {
  createSQLiteRepositoryService,
  migrateSQLiteDatabase,
} from "../../apps/api/src/services/adapters/repository/sqlite-repository-service.js";
import { createFetchApiService } from "../../apps/web/src/services/adapters/api/fetch-api-service.js";
import { createMemorySQLite, createSequentialIdService } from "./api/api-fixtures.js";

export const memoryUrl = "http://memory";
export const jsonHeaders = { "Content-Type": "application/json" };

/** Front API client wired to the in-memory API. */
export function createMemoryApi() {
  return createFetchApiService({ baseUrl: memoryUrl, fetchClient: createMemoryFetch() });
}

/** Full API (DI, repository, Express) over the in-memory SQLite double, reached via the transport double. */
export function createMemoryFetch(): typeof fetch {
  const database = createMemorySQLite();
  const repository = createSQLiteRepositoryService(
    createSequentialIdService(),
    migrateSQLiteDatabase(database.client),
  );

  return createTransport(createApp(createDependencies({ repository })));
}

/** Express and its JSON middleware run on memory streams, without listen/connect. */
export function createTransport(app: ReturnType<typeof createApp>): typeof fetch {
  return async (input, options) => {
    const url = new URL(String(input));

    const request = new IncomingMessage(new PassThrough() as unknown as Socket);
    request.method = options?.method ?? "GET";
    request.url = `${url.pathname}${url.search}`;

    const body = typeof options?.body === "string" ? options.body : "";
    request.headers = Object.fromEntries(new Headers(options?.headers));

    if (body) {
      request.headers["content-length"] = String(Buffer.byteLength(body));
    }

    request.httpVersionMajor = 1;
    request.httpVersionMinor = 1;

    const response = new ServerResponse(request);
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on("data", (chunk: Buffer) => chunks.push(chunk));
    response.assignSocket(output as unknown as Socket);

    const result = new Promise<Response>((resolve, reject) => {
      response.on("error", reject);
      response.on("finish", () => {
        const bytes = Buffer.concat(chunks).toString();
        const content = bytes.slice(bytes.indexOf("\r\n\r\n") + 4);

        resolve(
          new Response(response.statusCode === 204 ? null : content, {
            status: response.statusCode,
            headers: { "Content-Type": "application/json" },
          }),
        );
      });
    });

    app(request, response);
    request.push(body || null);

    if (body) {
      request.push(null);
    }

    return result;
  };
}

/** Asserts the single AppError shape: message, status and a textual description, nothing else. */
export function assertAppError(value: unknown, message: AppError["message"], status: number) {
  assert.ok(typeof value === "object" && value !== null);

  const error = value as AppError;
  assert.equal(error.message, message);
  assert.equal(error.status, status);
  assert.equal(typeof error.description, "string");
  assert.deepEqual(Object.keys(error).sort(), ["description", "message", "status"]);
}
