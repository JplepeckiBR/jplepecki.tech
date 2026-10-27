// Build-time info for the footer: short commit hash + build timestamp.
// Resolved once at build (module scope). Degrades gracefully if git is absent
// (e.g. certain CI contexts) — falls back to env vars then 'dev'.

import { execSync } from 'node:child_process';

function resolveCommit(): string {
  // GitHub Actions exposes the SHA; prefer it in CI.
  const envSha =
    process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
  if (envSha) return envSha.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

export const COMMIT_HASH = resolveCommit();
export const BUILD_TIME = new Date();
