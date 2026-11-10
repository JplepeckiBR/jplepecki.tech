// Build metadata resolved once during static generation.
import { execSync } from 'node:child_process';

function resolveCommit(): string {
  const envSha = process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? process.env.COMMIT_SHA;
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
export const BUILD_MONTH = BUILD_TIME.toISOString().slice(0, 7);
