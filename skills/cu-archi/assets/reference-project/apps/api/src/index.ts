import { z } from "zod";
import { createApp } from "./app.js";
import { openSQLiteDatabase } from "./services/adapters/repository/sqlite-repository-service.js";
import { createDependencies } from "./services/di.js";

const port = z.coerce
  .number()
  .int()
  .min(1)
  .max(65535)
  .parse(process.env.PORT ?? 3001);

const dependencies = createDependencies({ database: openSQLiteDatabase("todos.sqlite") });

const app = createApp(dependencies);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
