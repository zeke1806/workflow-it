import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  createTodoInputSchema,
  updateTodoInputSchema,
  todoSchema,
  todoTitleSchema,
} from "@cu-archi/core/todo";

describe("packages/core/todo/todo-types", () => {
  describe("1. Contrats partagés", () => {
    it("1.1 refuse les types de champ invalides et conserve les mises à jour partielles", () => {
      assert.equal(createTodoInputSchema.safeParse({ title: 123 }).success, false);
      assert.equal(
        createTodoInputSchema.safeParse({ title: "Draft", completed: "false" }).success,
        false,
      );
      assert.deepEqual(createTodoInputSchema.parse({ title: "Draft" }), {
        title: "Draft",
        projectId: null,
      });
      assert.deepEqual(updateTodoInputSchema.parse({ completed: false }), { completed: false });
    });

    it("1.2 valide une Todo sans modifier l'entrée et retourne une valeur readonly", () => {
      const input = { id: "one", title: "Shared", completed: false, projectId: null };
      const todo = todoSchema.parse(input);
      input.title = "External change";
      assert.equal(todo.title, "Shared");
      assert.equal(Object.isFrozen(todo), true);
    });

    it("1.3 applique le même titre non vide et normalisé à l'entité et aux écritures", () => {
      for (const title of ["", "   ", "\t\n"]) {
        assert.equal(todoTitleSchema.safeParse(title).success, false);
        assert.equal(createTodoInputSchema.safeParse({ title }).success, false);
        assert.equal(updateTodoInputSchema.safeParse({ title }).success, false);
        assert.equal(todoSchema.safeParse({ id: "one", title, completed: false }).success, false);
      }

      assert.equal(todoTitleSchema.parse("  Shared title  "), "Shared title");
      assert.equal(createTodoInputSchema.parse({ title: "  Created  " }).title, "Created");
      assert.equal(updateTodoInputSchema.parse({ title: "  Edited  " }).title, "Edited");
      assert.deepEqual(updateTodoInputSchema.parse({ completed: true }), { completed: true });
    });

    it("1.4 accepte un renommage seul et le retrait du projet", () => {
      assert.deepEqual(updateTodoInputSchema.parse({ title: "Renommer" }), { title: "Renommer" });
      assert.deepEqual(updateTodoInputSchema.parse({ projectId: null }), { projectId: null });
    });
  });
});
