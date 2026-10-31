import {
  appErrorSchema,
  createAppError,
  appErrors,
  type AppError,
  createProjectInputSchema,
  updateProjectInputSchema,
  projectIdSchema,
  projectSchema,
  createTodoInputSchema,
  listTodosInputSchema,
  todoIdSchema,
  todoSchema,
  updateTodoInputSchema,
} from "@cu-archi/core";
import { apiTodoListSchema, type Api, type ApiOptions } from "./api-types";

export function createApiService(options: ApiOptions = {}): Api {
  const baseUrl = (options.baseUrl ?? "/api").replace(/\/$/, "");
  const fetchClient = options.fetchClient ?? globalThis.fetch.bind(globalThis);

  return Object.freeze({
    project: Object.freeze({
      list: async () => {
        const response = await request(fetchClient, `${baseUrl}/projects`);

        return projectSchema
          .array()
          .readonly()
          .parse(await response.json());
      },

      create: async (input) => {
        const body = createProjectInputSchema.parse(input);
        const response = await request(fetchClient, `${baseUrl}/projects`, "POST", body);

        return projectSchema.parse(await response.json());
      },

      update: async (id, input) => {
        const path = `${baseUrl}/projects/${encodeURIComponent(projectIdSchema.parse(id))}`;
        const body = updateProjectInputSchema.parse(input);
        const response = await request(fetchClient, path, "PATCH", body);

        return projectSchema.parse(await response.json());
      },
    } satisfies Api["project"]),

    todo: Object.freeze({
      list: async (input) => {
        const { search, projectId } = listTodosInputSchema.parse(input ?? {});
        const params = new URLSearchParams();

        if (search !== undefined) {
          params.set("search", search);
        }

        if (projectId !== undefined) {
          params.set("projectId", projectId);
        }

        const query = params.size === 0 ? "" : `?${params}`;
        const response = await request(fetchClient, `${baseUrl}/todos${query}`);

        return apiTodoListSchema.parse(await response.json());
      },

      create: async (input) => {
        const body = createTodoInputSchema.parse(input);
        const response = await request(fetchClient, `${baseUrl}/todos`, "POST", body);

        return todoSchema.parse(await response.json());
      },

      update: async (id, input) => {
        const path = `${baseUrl}/todos/${encodeURIComponent(todoIdSchema.parse(id))}`;
        const body = updateTodoInputSchema.parse(input);
        const response = await request(fetchClient, path, "PATCH", body);

        return todoSchema.parse(await response.json());
      },

      delete: async (id) => {
        const path = `${baseUrl}/todos/${encodeURIComponent(todoIdSchema.parse(id))}`;
        await request(fetchClient, path, "DELETE");
      },
    } satisfies Api["todo"]),
  });
}

async function request(
  fetchClient: typeof fetch,
  url: string,
  method = "GET",
  body?: unknown,
): Promise<Response> {
  const response = await fetchClient(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw readAppError(response.status, await response.json().catch(() => null));
  }

  return response;
}

function readAppError(status: number, body: unknown): AppError {
  const parsed = appErrorSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ...createAppError(appErrors.internal, `API request failed with status ${status}`),
      status,
    };
  }

  return { ...parsed.data, status: parsed.data.status ?? status };
}
