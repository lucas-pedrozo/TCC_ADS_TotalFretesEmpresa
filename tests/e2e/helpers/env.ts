import fs from "node:fs";
import path from "node:path";

const ENV_FILE_NAME = ".env.e2e";
const EXAMPLE_ENV_FILE_NAME = ".env.e2e.example";

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();
  return { key, value };
}

export function loadE2EEnv() {
  const envFilePath = path.resolve(process.cwd(), "tests/e2e", ENV_FILE_NAME);
  if (!fs.existsSync(envFilePath)) return;

  const content = fs.readFileSync(envFilePath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    if (process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (value && value.trim().length > 0) return value;

  throw new Error(
    `Variável obrigatória ausente: ${name}. Configure em tests/e2e/${ENV_FILE_NAME} (veja ${EXAMPLE_ENV_FILE_NAME}) ou no ambiente.`
  );
}
