// Base URLs
const SANDBOX_API = '/api/sandbox/start';
const AI_API = '/api/ai/invoke';

/** Build the agent base URL for a given sandboxId */
export const agentBase = (sandboxId) =>
  `http://${sandboxId}.agent.localhost`;

/** POST /api/sandbox/start — creates a new sandbox */
export async function startSandbox() {
  const res = await fetch(SANDBOX_API, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to start sandbox: ${res.status}`);
  return res.json();
  // { message, sandboxId, previewUrl }
}

/** GET {agentBase}/list-files */
export async function listFiles(sandboxId) {
  const res = await fetch(`${agentBase(sandboxId)}/list-files`);
  if (!res.ok) throw new Error(`list-files failed: ${res.status}`);
  return res.json();
  // { message, files: string[] }
}

/** GET {agentBase}/read-files?files=path1,path2 */
export async function readFiles(sandboxId, files) {
  const params = new URLSearchParams({ files: files.join(',') });
  const res = await fetch(`${agentBase(sandboxId)}/read-files?${params}`);
  if (!res.ok) throw new Error(`read-files failed: ${res.status}`);
  return res.json();
  // { message, files: [{"/path": "content"}, ...] }
}

/** PATCH {agentBase}/update-files */
export async function updateFiles(sandboxId, updates) {
  const res = await fetch(`${agentBase(sandboxId)}/update-files`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error(`update-files failed: ${res.status}`);
  return res.json();
}

/**
 * POST /api/ai/invoke — streaming response
 * Returns a ReadableStream reader for the caller to consume.
 * @param {string} message
 * @param {string} projectId  (sandboxId)
 */
export async function invokeAI(message, projectId) {
  const res = await fetch(AI_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, projectId }),
  });
  if (!res.ok) throw new Error(`AI invoke failed: ${res.status}`);
  return res; // caller reads res.body
}
