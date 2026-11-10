import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.map', '.mjs', '.svg', '.txt', '.xml']);
const FORBIDDEN = [
  { label: 'notion.so', pattern: /notion\.so\b/i },
  { label: 'notion.site', pattern: /notion\.site\b/i },
  { label: 'notionusercontent.com', pattern: /notionusercontent\.com\b/i },
  { label: 'notion-static.com', pattern: /notion-static\.com\b/i },
  { label: 'prod-files-secure', pattern: /prod-files-secure/i },
];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(resolved));
    else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(resolved);
  }
  return files;
}

const findings = [];
for (const file of await filesUnder(DIST)) {
  const source = await readFile(file, 'utf8');
  for (const forbidden of FORBIDDEN) {
    if (forbidden.pattern.test(source)) {
      findings.push(`${path.relative(process.cwd(), file)}: ${forbidden.label}`);
    }
  }
}

if (findings.length > 0) {
  console.error('Built output contains forbidden Notion or signed-file hosts:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log('No Notion or signed-file hosts found in built text output.');
}
