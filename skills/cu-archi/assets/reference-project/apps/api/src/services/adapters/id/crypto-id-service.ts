import { randomUUID } from "node:crypto";
import type { IdService } from "./id-types.js";

export function createCryptoIdService(): IdService {
  return Object.freeze({
    create: () => {
      return randomUUID();
    },
  });
}
