// SessionStart : propose la mise à jour du plugin quand une version plus récente est publiée.
// Jamais bloquant : toute erreur (hors-ligne, timeout, JSON invalide) sort en silence.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MANIFEST_URL =
  process.env.WORKFLOW_IT_MANIFEST_URL ??
  "https://raw.githubusercontent.com/zeke1806/workflow-it/main/.claude-plugin/plugin.json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheFile = join(process.env.CLAUDE_PLUGIN_DATA ?? join(tmpdir(), "workflow-it-plugin"), "update-check.json");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const isNewer = (candidate, current) => {
  const a = candidate.split(".").map(Number);
  const b = current.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

const latestVersion = async () => {
  try {
    const cache = readJson(cacheFile);
    if (Date.now() - cache.checkedAt < CACHE_TTL_MS && cache.latest) return cache.latest;
  } catch {
    // Pas de cache exploitable : on interroge le dépôt.
  }
  const response = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) return null;
  const { version } = await response.json();
  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify({ checkedAt: Date.now(), latest: version }));
  return version;
};

try {
  if (process.env.WORKFLOW_IT_NO_UPDATE_CHECK === "1") process.exit(0);
  const current = readJson(join(pluginRoot, ".claude-plugin", "plugin.json")).version;
  const latest = await latestVersion();
  if (!latest || !isNewer(latest, current)) process.exit(0);

  console.log(
    JSON.stringify({
      systemMessage: `workflow-it-plugin ${latest} disponible (installé : ${current}).`,
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: [
          `workflow-it-plugin : la version ${latest} est publiée, la version installée est ${current}.`,
          "Proposer une fois à l'utilisateur de mettre à jour, sans le faire sans son accord. Commandes :",
          "`claude plugin marketplace update workflow-it` puis `claude plugin update workflow-it-plugin@workflow-it`, puis redémarrer la session.",
        ].join("\n"),
      },
    }),
  );
} catch {
  process.exit(0);
}
