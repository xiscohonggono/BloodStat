import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { normalizeStatus, normalizeType, parseFrontmatter, parsePlan } from './sync-engineering-plans.mjs';

test('parses the approved YAML frontmatter and dependency IDs', () => {
  const source = `---\nid: 2026-11-20-feature-x\ntype: business_feature\nstatus: approved\nsummary: "Support feature X: safely."\ndepends_on:\n  - 2026-11-18-fhir-box-rollout-dates\n  - 2026-11-18-validate-example-bundle\n---\n\n# Feature X\n\n## Goal\nMake feature X available.\n\n## Dependencies\nNeeds the data validation plan.`;
  const parsed = parsePlan(source, 'docs/plans/pending/2026-11-20-feature-x.md');
  assert.equal(parsed.planKey, '2026-11-20-feature-x');
  assert.equal(parsed.title, 'Feature X');
  assert.equal(parsed.type, 'Business Feature');
  assert.equal(parsed.status, 'Approved');
  assert.equal(parsed.summary, 'Support feature X: safely.');
  assert.deepEqual(parsed.dependsOn, ['2026-11-18-fhir-box-rollout-dates', '2026-11-18-validate-example-bundle']);
  assert.match(parsed.content, /## Dependencies/);
  assert.match(parsed.content, /Repository source/);
  assert.doesNotMatch(parsed.content, /^---/);
});

test('reads the existing repository plan format without inventing type or dependencies', () => {
  const source = readFileSync('docs/plans/pending/2026-11-18-fhir-box-rollout-dates.md', 'utf8');
  const parsed = parsePlan(source, 'docs/plans/pending/2026-11-18-fhir-box-rollout-dates.md');
  assert.equal(parsed.planKey, '2026-11-18-fhir-box-rollout-dates');
  assert.equal(parsed.title, 'Verify FHIR Box rollout dates');
  assert.equal(parsed.status, 'Pending');
  assert.equal(parsed.type, null);
  assert.deepEqual(parsed.dependsOn, []);
  assert.match(parsed.summary, /FHIR Box dates in the pitch deck should be correct/);
  assert.match(parsed.sourceUrl, /docs\/plans\/pending\/2026-11-18-fhir-box-rollout-dates\.md$/);
});

test('all three existing pending plans produce summaries and stable file-stem keys', () => {
  const files = readdirSync('docs/plans/pending').filter((name) => name.endsWith('.md')).sort();
  assert.equal(files.length, 3);
  for (const name of files) {
    const rel = path.posix.join('docs/plans/pending', name);
    const plan = parsePlan(readFileSync(rel, 'utf8'), rel);
    assert.equal(plan.planKey, path.basename(name, '.md'));
    assert.ok(plan.title);
    assert.ok(plan.summary);
    assert.equal(plan.status, 'Pending');
  }
});

test('maps repository statuses and approved work types to Notion options', () => {
  assert.equal(normalizeStatus('pending'), 'Pending');
  assert.equal(normalizeStatus('in_progress'), 'In Progress');
  assert.equal(normalizeStatus('implemented'), 'Done');
  assert.equal(normalizeStatus('dropped'), 'Archived');
  assert.equal(normalizeType('technical_debt'), 'Technical Debt');
  assert.equal(normalizeType('not-specified'), null);
  assert.equal(normalizeStatus('not-specified'), null);
});

test('parses inline empty dependency list', () => {
  const parsed = parseFrontmatter('---\nid: x\ndepends_on: []\n---\n# X');
  assert.deepEqual(parsed.fields.depends_on, []);
});
