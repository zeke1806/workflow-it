import express, { type Express, type NextFunction, type Request, type Response } from "express";
import {
  createAppError,
  appErrors,
  isAppError,
  type AppError,
  createProjectInputSchema,
  updateProjectInputSchema,
  projectIdSchema,
  type ProjectService,
  createTodoInputSchema,
  listTodosInputSchema,
  todoIdSchema,
  updateTodoInputSchema,
  type TodoService,
} from "@cu-archi/core";
import { ZodError } from "zod";
import type { Dependencies } from "./services/di.js";

export function createApp(dependencies: Dependencies) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  registerTodoRoutes(app, dependencies.todo);
  registerProjectRoutes(app, dependencies.project);

  app.use((_request, response) => {
    sendError(response, createAppError(appErrors.routeNotFound, "No route matches the request"));
  });

  app.use(handleError);

  return app;
}

function registerTodoRoutes(app: Express, todo: TodoService): void {
  app.get("/todos", async (request, response) => {
    const input = listTodosInputSchema.parse(request.query);
    response.json(await todo.list(input));
  });

  app.post("/todos", async (request, response) => {
    const input = createTodoInputSchema.parse(request.body);
    response.status(201).json(await todo.create(input));
  });

  app.patch("/todos/:id", async (request, response) => {
    const id = todoIdSchema.parse(request.params.id);
    const input = updateTodoInputSchema.parse(request.body);
    response.json(await todo.update(id, input));
  });

  app.delete("/todos/:id", async (request, response) => {
    const id = todoIdSchema.parse(request.params.id);
    await todo.delete(id);
    response.sendStatus(204);
  });
}

function registerProjectRoutes(app: Express, project: ProjectService): void {
  app.get("/projects", async (_request, response) => {
    response.json(await project.list());
  });

  app.post("/projects", async (request, response) => {
    const input = createProjectInputSchema.parse(request.body);
    response.status(201).json(await project.create(input));
  });

  app.patch("/projects/:id", async (request, response) => {
    const id = projectIdSchema.parse(request.params.id);
    const input = updateProjectInputSchema.parse(request.body);
    response.json(await project.update(id, input));
  });
}

function handleError(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  sendError(response, toAppError(error));
}

function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return createAppError(appErrors.invalidInput, error.issues[0]?.message ?? "Invalid request");
  }

  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    return createAppError(appErrors.invalidInput, "Invalid JSON");
  }

  console.error(error);

  return createAppError(appErrors.internal, "Internal server error");
}

function sendError(response: Response, error: AppError): void {
  const status = error.status ?? appErrors.internal.status;

  response.status(status).json({ message: error.message, description: error.description, status });
}
