import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = 'https://api.notion.com/v1';
const API_VERSION = '2026-03-11';
const PLAN_DIRS = ['docs/plans/pending', 'docs/plans/implemented'];
const repoRoot = process.cwd();
let lastRequestAt = 0;

function stripYamlComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if ((char === '"' || char === "'") && value[i - 1] !== '\\') {
      quote = quote === char ? null : quote ?? char;
    }
    if (char === '#' && !quote && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i).trim();
    }
  }
  return value.trim();
}

function parseScalar(raw) {
  const value = stripYamlComment(raw).trim();
  if (!value) return '';
  if (value === '[]') return [];
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((part) => parseScalar(part)).filter(Boolean);
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    try { return JSON.parse(value); } catch { return value.slice(1, -1); }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
  return value;
}

export function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { fields: {}, body: source, hasFrontmatter: false };
  const fields = {};
  let listKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      if (!Array.isArray(fields[listKey])) fields[listKey] = [];
      fields[listKey].push(parseScalar(listItem[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!field) continue;
    listKey = null;
    const [, key, rawValue] = field;
    const value = parseScalar(rawValue);
    fields[key] = value;
    if (rawValue.trim() === '') {
      fields[key] = [];
      listKey = key;
    }
  }
  return { fields, body: source.slice(match[0].length), hasFrontmatter: true };
}

export function normalizeType(value) {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  if (['business_feature', 'businessfeature', 'feature'].includes(normalized)) return 'Business Feature';
  if (normalized === 'enhancement') return 'Enhancement';
  if (['technical_debt', 'technicaldebt'].includes(normalized)) return 'Technical Debt';
  return null;
}

export function normalizeStatus(value, fallback = 'pending') {
  const normalized = String(value ?? fallback).trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  const statuses = {
    pending: 'Pending',
    approved: 'Approved',
    in_progress: 'In Progress',
    implemented: 'Done',
    done: 'Done',
    dropped: 'Archived',
    archived: 'Archived',
  };
  return statuses[normalized] ?? null;
}

function plainText(value) {
  return String(value ?? '')
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSection(source, heading) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${heading}\\s*$`, 'i').test(line.trim()));
  if (start < 0) return '';
  const content = [];
  for (let i = start + 1; i < lines.length && !/^#{1,6}\s/.test(lines[i]); i += 1) content.push(lines[i]);
  return content.join('\n').trim();
}

function goalSummary(source) {
  const section = getSection(source, 'Goal');
  if (section) {
    const paragraph = section.split(/\n\s*\n/)[0];
    const cleaned = plainText(paragraph);
    if (cleaned) return cleaned;
  }
  const firstParagraph = source
    .split(/\r?\n/)
    .filter((line) => line.trim() && !/^#{1,6}\s/.test(line) && !/^\s*-\s*(Status|Planned|Merged|Decisions):/i.test(line))
    .join(' ');
  return plainText(firstParagraph);
}

function titleFromBody(body, fallback) {
  const heading = body.match(/^#\s+(.+)\s*$/m);
  return heading ? plainText(heading[1]) : fallback;
}

function getLegacyMetadata(body) {
  const metadata = {};
  for (const line of body.split(/\r?\n/)) {
    if (/^##\s/.test(line)) break;
    const match = line.match(/^\s*-\s*([^:]+):\s*(.*?)\s*$/);
    if (match) metadata[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return metadata;
}

function githubUrl(repo, ref, relativePath) {
  const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${repo}/blob/${encodeURIComponent(ref)}/${encodedPath}`;
}

function absolutizeRelativeLinks(markdown, sourcePath, repo, ref) {
  return markdown.replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (whole, prefix, destination, suffix) => {
    if (/^(?:https?:|mailto:|data:|#)/i.test(destination)) return whole;
    const pathPart = destination.split(/[?#]/, 1)[0];
    if (!pathPart) return whole;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), pathPart)).replace(/^\.\//, '');
    if (resolved === '..' || resolved.startsWith('../')) return whole;
    return `${prefix}${githubUrl(repo, ref, resolved)}${suffix}`;
  });
}

export function parsePlan(source, relativePath, options = {}) {
  const repo = options.repo ?? 'xiscohonggono/BloodStat';
  const ref = options.ref ?? 'main';
  const { fields, body: markdownBody } = parseFrontmatter(source);
  const legacy = getLegacyMetadata(markdownBody);
  const basename = path.posix.basename(relativePath, path.posix.extname(relativePath));
  const title = titleFromBody(markdownBody, basename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replaceAll('-', ' '));
  const planKey = String(fields.id ?? basename).trim();
  const rawType = fields.type ?? legacy.type;
  const type = normalizeType(rawType);
  if (rawType && !type) throw new Error(`Unsupported plan type '${rawType}' in ${relativePath}.`);
  const folderStatus = relativePath.startsWith('docs/plans/implemented/') ? 'implemented' : 'pending';
  const rawStatus = fields.status ?? legacy.status;
  const status = normalizeStatus(rawStatus, folderStatus);
  if (!status) throw new Error(`Unsupported plan status '${rawStatus}' in ${relativePath}.`);
  const summary = plainText(fields.summary) || goalSummary(markdownBody) || title;
  const dependsRaw = fields.depends_on ?? [];
  const dependsOn = (Array.isArray(dependsRaw) ? dependsRaw : String(dependsRaw).split(','))
    .map((value) => String(value).trim())
    .filter(Boolean);
  const sourceUrl = githubUrl(repo, ref, relativePath);
  let content = markdownBody.trim();
  content = content.replace(/^#\s+[^\r\n]+\s*(?:\r?\n)?/, '').trim();
  content = absolutizeRelativeLinks(content, relativePath, repo, ref);
  const sourceFooter = `## Repository source\n\n[${path.posix.basename(relativePath)}](${sourceUrl})`;
  content = content ? `${content}\n\n${sourceFooter}` : sourceFooter;
  return { planKey, title, type, status, summary, dependsOn, sourcePath: relativePath, sourceUrl, content };
}

function listMarkdownFiles(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...listMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) result.push(path.relative(repoRoot, fullPath).split(path.sep).join('/'));
  }
  return result;
}

function changedMarkdownFiles() {
  const before = process.env.GITHUB_EVENT_BEFORE ?? '';
  const sha = process.env.GITHUB_SHA ?? 'HEAD';
  if (!before || /^0+$/.test(before)) {
    return process.env.GITHUB_EVENT_NAME === 'push' ? listMarkdownFiles('docs/plans/pending') : [];
  }
  try {
    const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMRT', before, sha, '--', ...PLAN_DIRS], { encoding: 'utf8' });
    return output.split(/\r?\n/).filter((file) => file.toLowerCase().endsWith('.md') && existsSync(path.join(repoRoot, file)));
  } catch (error) {
    throw new Error(`Could not determine changed plan files from the Git push: ${error.message}`);
  }
}

export function selectPlanFiles(scope, eventName = process.env.GITHUB_EVENT_NAME ?? '') {
  if (scope === 'pending') return listMarkdownFiles('docs/plans/pending').sort();
  if (scope === 'all') return PLAN_DIRS.flatMap((directory) => listMarkdownFiles(directory)).sort();
  if (scope === 'changed' || eventName === 'push') return changedMarkdownFiles().sort();
  return [];
}

function splitRichText(value) {
  const text = String(value ?? '');
  if (!text) return [];
  const parts = [];
  for (let start = 0; start < text.length; start += 1900) {
    parts.push({ type: 'text', text: { content: text.slice(start, start + 1900) } });
  }
  return parts;
}

function makePageProperties(plan) {
  const properties = {
    Name: { title: [{ type: 'text', text: { content: plan.title.slice(0, 1900) } }] },
    Status: { select: { name: plan.status } },
    Summary: { rich_text: splitRichText(plan.summary) },
    Source: { url: plan.sourceUrl },
    'Plan key': { rich_text: splitRichText(plan.planKey) },
  };
  if (plan.type) properties.Type = { select: { name: plan.type } };
  return properties;
}

function readPlanKey(page) {
  const value = page.properties?.['Plan key'];
  const chunks = value?.rich_text ?? value?.text ?? [];
  return chunks.map((chunk) => chunk.plain_text ?? chunk.text?.content ?? '').join('');
}

let apiToken = '';
async function notionRequest(method, apiPath, body, query = undefined) {
  const url = new URL(`${API_BASE}${apiPath}`);
  if (query) for (const [key, value] of Object.entries(query)) url.searchParams.append(key, value);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const wait = Math.max(0, 350 - (Date.now() - lastRequestAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Notion-Version': API_VERSION,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    lastRequestAt = Date.now();
    const text = await response.text();
    if ([429, 503, 529].includes(response.status) && attempt < 4) {
      const retryAfter = Number(response.headers.get('retry-after'));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    if (!response.ok) throw new Error(`Notion API ${method} ${apiPath} returned ${response.status}: ${text.slice(0, 600)}`);
    return text ? JSON.parse(text) : {};
  }
  throw new Error(`Notion API ${method} ${apiPath} exceeded the retry limit.`);
}

async function verifyDataSource(dataSourceId) {
  const source = await notionRequest('GET', `/data_sources/${encodeURIComponent(dataSourceId)}`);
  const expected = {
    Name: 'title',
    Type: 'select',
    Status: 'select',
    Summary: 'rich_text',
    Source: 'url',
    'Plan key': 'rich_text',
    'Depends on': 'relation',
  };
  for (const [name, type] of Object.entries(expected)) {
    if (source.properties?.[name]?.type !== type) {
      throw new Error(`Engineering Plans data source is missing ${name} (${type}). Check the data source ID and schema.`);
    }
  }
}

async function listExistingPages(dataSourceId) {
  const pages = [];
  let cursor;
  do {
    const body = { result_type: 'page', page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const response = await notionRequest('POST', `/data_sources/${encodeURIComponent(dataSourceId)}/query`, body, { filter_properties: 'Plan key' });
    if (response.request_status?.type === 'incomplete') throw new Error('Notion returned an incomplete data-source query. Narrow the query before syncing.');
    pages.push(...response.results.filter((item) => item.object === 'page'));
    cursor = response.next_cursor ?? undefined;
  } while (cursor);
  return pages;
}

async function createPage(dataSourceId, plan) {
  return notionRequest('POST', '/pages', {
    parent: { data_source_id: dataSourceId },
    properties: makePageProperties(plan),
    markdown_version: 'v2',
    markdown: plan.content,
  });
}

async function updatePage(pageId, plan) {
  await notionRequest('PATCH', `/pages/${encodeURIComponent(pageId)}`, { properties: makePageProperties(plan) });
  await notionRequest('PATCH', `/pages/${encodeURIComponent(pageId)}/markdown`, {
    markdown_version: 'v2',
    type: 'replace_content',
    replace_content: { new_str: plan.content },
  });
}

async function syncPlans(plans, dataSourceId) {
  await verifyDataSource(dataSourceId);
  const existing = await listExistingPages(dataSourceId);
  const pageByKey = new Map(existing.map((page) => [readPlanKey(page), page.id]).filter(([key]) => key));
  const processed = [];

  for (const plan of plans) {
    const existingId = pageByKey.get(plan.planKey);
    const page = existingId ? (await updatePage(existingId, plan), { id: existingId }) : await createPage(dataSourceId, plan);
    pageByKey.set(plan.planKey, page.id);
    processed.push({ ...plan, pageId: page.id });
    console.log(`${existingId ? 'Updated' : 'Created'} ${plan.planKey}`);
  }

  const unresolved = [];
  for (const plan of processed) {
    const missing = plan.dependsOn.filter((key) => !pageByKey.has(key));
    if (missing.length) unresolved.push(`${plan.planKey}: ${missing.join(', ')}`);
  }
  if (unresolved.length) {
    throw new Error(`Could not resolve depends_on IDs. Sync target plans first, then rerun:\n${unresolved.join('\n')}`);
  }

  for (const plan of processed) {
    const relation = plan.dependsOn.map((key) => ({ id: pageByKey.get(key) }));
    await notionRequest('PATCH', `/pages/${encodeURIComponent(plan.pageId)}`, {
      properties: { 'Depends on': { relation } },
    });
  }
}

export async function runSync(env = process.env) {
  const scope = env.INPUT_SYNC_SCOPE ?? (env.GITHUB_EVENT_NAME === 'push' ? 'changed' : 'pending');
  const eventName = env.GITHUB_EVENT_NAME ?? '';
  const dryRun = env.INPUT_DRY_RUN === undefined
    ? eventName !== 'push'
    : String(env.INPUT_DRY_RUN).toLowerCase() === 'true';
  const repo = env.GITHUB_REPOSITORY ?? 'xiscohonggono/BloodStat';
  const ref = env.GITHUB_REF_NAME ?? 'main';
  const files = selectPlanFiles(scope, eventName);
  if (!files.length) {
    console.log('No plan files matched this run.');
    return;
  }
  const plans = files.map((relativePath) => parsePlan(readFileSync(path.join(repoRoot, relativePath), 'utf8'), relativePath, { repo, ref }));
  console.log(`Prepared ${plans.length} plan(s):`);
  for (const plan of plans) console.log(`- ${plan.planKey} | ${plan.status} | ${plan.type ?? 'Type not set'} | ${plan.summary}`);
  if (dryRun) {
    console.log('Dry run only; no Notion pages were read or changed.');
    return;
  }
  apiToken = env.NOTION_API_KEY ?? '';
  const dataSourceId = (env.NOTION_DATA_SOURCE_ID ?? '').replace(/^collection:\/\//, '');
  if (!apiToken) throw new Error('Set the NOTION_API_KEY GitHub secret before running a write sync.');
  if (!dataSourceId) throw new Error('Set NOTION_DATA_SOURCE_ID to the Engineering Plans data-source ID.');
  await syncPlans(plans, dataSourceId);
  console.log(`Sync complete for ${plans.length} plan(s).`);
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  runSync().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Plan sync failed.');
    process.exitCode = 1;
  });
}
