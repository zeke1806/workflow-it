import { createErrorsService } from "./errors/errors-service.ts";

// DI du core : composition seulement, singleton créé au chargement et importé tel quel
// par les apps (`import { core } from "@cu-archi/core"`), sans injection ni mock.
function createCoreDependencies() {
  const errorsService = createErrorsService();

  return Object.freeze({ errorsService });
}

export const core = createCoreDependencies();
