/**
 * Builds the per-module report from the Cucumber JSON produced by playwright-bdd:
 *   reports/modules/index.html   — styled dashboard (one card per module, scenario table, Jira links)
 *   reports/modules/summary.json — machine-readable totals (used by jira-publish-results.ts)
 *   reports/modules/summary.md   — Markdown table (appended to the GitHub Actions job summary)
 *
 * Usage: tsx scripts/module-report.ts [cucumber-json] [out-dir]
 */
import fs from 'node:fs';
import path from 'node:path';

interface CucumberStep {
  keyword: string;
  name: string;
  result?: { status: string; duration?: number; error_message?: string };
}
interface CucumberElement {
  name: string;
  type: string;
  tags?: { name: string }[];
  steps: CucumberStep[];
  before?: CucumberStep[];
  after?: CucumberStep[];
}
interface CucumberFeature {
  name: string;
  uri: string;
  tags?: { name: string }[];
  elements: CucumberElement[];
}

type Status = 'passed' | 'failed' | 'skipped';

export interface ScenarioResult {
  name: string;
  status: Status;
  durationMs: number;
  tags: string[];
  error?: string;
}

export interface ModuleResult {
  module: string;
  tag: string;
  jira: string;
  feature: string;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  scenarios: ScenarioResult[];
}

export interface Summary {
  generatedAt: string;
  target: string;
  runUrl: string;
  totals: { passed: number; failed: number; skipped: number; scenarios: number; durationMs: number };
  modules: ModuleResult[];
}

const JIRA_BASE = process.env.JIRA_BASE_URL ?? 'https://ebrasalem93.atlassian.net';

function scenarioStatus(element: CucumberElement): Status {
  const results = [...(element.before ?? []), ...element.steps, ...(element.after ?? [])].map((s) => s.result?.status);
  if (results.some((s) => s === 'failed')) return 'failed';
  if (results.length && results.every((s) => s === 'passed')) return 'passed';
  return 'skipped';
}

function durationOf(element: CucumberElement): number {
  return [...(element.before ?? []), ...element.steps, ...(element.after ?? [])].reduce(
    (sum, s) => sum + (s.result?.duration ?? 0) / 1e6,
    0,
  );
}

export function buildSummary(features: CucumberFeature[]): Summary {
  const byModule = new Map<string, ModuleResult>();
  for (const feature of features) {
    const tags = (feature.tags ?? []).map((t) => t.name);
    const jira = tags.find((t) => /^@[A-Z]+-\d+$/.test(t))?.slice(1) ?? '';
    const tag = tags.find((t) => t !== `@${jira}`) ?? '';
    const current = byModule.get(feature.name) ?? {
      module: feature.name,
      tag,
      jira,
      feature: path.basename(feature.uri),
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      scenarios: [],
    };
    for (const element of feature.elements.filter((e) => e.type === 'scenario')) {
      const status = scenarioStatus(element);
      const failedStep = element.steps.find((s) => s.result?.status === 'failed');
      const durationMs = durationOf(element);
      current[status] += 1;
      current.durationMs += durationMs;
      current.scenarios.push({
        name: element.name,
        status,
        durationMs,
        tags: (element.tags ?? []).map((t) => t.name),
        error: failedStep
          ? `${failedStep.keyword.trim()} ${failedStep.name}: ${(failedStep.result?.error_message ?? '').split('\n')[0]}`
          : undefined,
      });
    }
    byModule.set(feature.name, current);
  }
  const modules = [...byModule.values()];
  const totals = modules.reduce(
    (t, m) => ({
      passed: t.passed + m.passed,
      failed: t.failed + m.failed,
      skipped: t.skipped + m.skipped,
      scenarios: t.scenarios + m.scenarios.length,
      durationMs: t.durationMs + m.durationMs,
    }),
    { passed: 0, failed: 0, skipped: 0, scenarios: 0, durationMs: 0 },
  );
  const runUrl =
    process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY
      ? `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '';
  return {
    generatedAt: new Date().toISOString(),
    target: process.env.BASE_URL ?? 'https://demo.opencart.com',
    runUrl,
    totals,
    modules,
  };
}

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

export function toMarkdown(summary: Summary): string {
  const rows = summary.modules.map(
    (m) =>
      `| ${m.failed ? '❌' : '✅'} ${m.module} | [${m.jira}](${JIRA_BASE}/browse/${m.jira}) | ${m.passed} | ${m.failed} | ${m.skipped} | ${seconds(m.durationMs)} |`,
  );
  const { totals } = summary;
  return [
    '## Playwright BDD — results by module',
    '',
    `Target: \`${summary.target}\``,
    '',
    '| Module | Jira | Passed | Failed | Skipped | Time |',
    '|---|---|---|---|---|---|',
    ...rows,
    `| **Total** | | **${totals.passed}** | **${totals.failed}** | **${totals.skipped}** | ${seconds(totals.durationMs)} |`,
    '',
  ].join('\n');
}

export function toHtml(summary: Summary): string {
  const { totals } = summary;
  const passRate = totals.scenarios ? Math.round((totals.passed / totals.scenarios) * 100) : 0;
  const cards = summary.modules
    .map((m) => {
      const rate = m.scenarios.length ? Math.round((m.passed / m.scenarios.length) * 100) : 0;
      const scenarios = m.scenarios
        .map(
          (s) =>
            `<tr class="${s.status}"><td><span class="dot"></span>${escapeHtml(s.name)}${
              s.error ? `<div class="err">${escapeHtml(s.error)}</div>` : ''
            }</td><td>${s.status}</td><td>${seconds(s.durationMs)}</td></tr>`,
        )
        .join('');
      return `<section class="card ${m.failed ? 'has-fail' : ''}">
  <header><h2>${escapeHtml(m.module)}</h2><a href="${JIRA_BASE}/browse/${m.jira}" target="_blank" rel="noopener">${m.jira}</a></header>
  <p class="meta"><code>${escapeHtml(m.feature)}</code> · <code>${escapeHtml(m.tag)}</code></p>
  <div class="bar"><span style="width:${rate}%"></span></div>
  <p class="counts"><b>${m.passed}</b> passed · <b>${m.failed}</b> failed · <b>${m.skipped}</b> skipped · ${seconds(m.durationMs)}</p>
  <table>${scenarios}</table>
</section>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OpenCart Module Report</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#1d2330;--muted:#5d6675;--line:#e3e6eb;--ok:#1a7f4e;--bad:#c43d3d;--skip:#9a7b16}
@media (prefers-color-scheme:dark){:root{--bg:#12151b;--card:#1b2029;--ink:#e8ebf0;--muted:#9aa3b2;--line:#2b313c;--ok:#46c08a;--bad:#ef6b6b;--skip:#d8b34a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px}h1{margin:0 0 4px;font-size:26px}.sub{color:var(--muted);margin:0 0 20px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:26px}
.kpi.ok b{color:var(--ok)}.kpi.bad b{color:var(--bad)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}.card.has-fail{border-color:var(--bad)}
.card header{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.card h2{font-size:17px;margin:0}
.card a{color:inherit;font-weight:600}.meta{color:var(--muted);margin:4px 0 10px;font-size:13px}
.bar{height:6px;background:var(--line);border-radius:3px;overflow:hidden}.bar span{display:block;height:100%;background:var(--ok)}
.counts{font-size:13px;color:var(--muted)}table{width:100%;border-collapse:collapse;font-size:13px}
td{padding:6px 4px;border-top:1px solid var(--line);vertical-align:top}td:nth-child(2),td:nth-child(3){white-space:nowrap;color:var(--muted)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background:var(--skip)}
tr.passed .dot{background:var(--ok)}tr.failed .dot{background:var(--bad)}.err{color:var(--bad);font-size:12px;margin-top:4px;word-break:break-word}
</style></head>
<body><main>
<h1>OpenCart — results by module</h1>
<p class="sub">Playwright + TypeScript + Cucumber BDD · target <code>${escapeHtml(summary.target)}</code> · ${escapeHtml(
    new Date(summary.generatedAt).toUTCString(),
  )}${summary.runUrl ? ` · <a href="${summary.runUrl}">CI run</a>` : ''}</p>
<div class="kpis">
  <div class="kpi"><span>Scenarios</span><b>${totals.scenarios}</b></div>
  <div class="kpi ok"><span>Passed</span><b>${totals.passed}</b></div>
  <div class="kpi bad"><span>Failed</span><b>${totals.failed}</b></div>
  <div class="kpi"><span>Pass rate</span><b>${passRate}%</b></div>
  <div class="kpi"><span>Modules</span><b>${summary.modules.length}</b></div>
</div>
<div class="grid">
${cards}
</div>
</main></body></html>`;
}

function main(): void {
  const input = process.argv[2] ?? 'reports/cucumber/cucumber-report.json';
  const outDir = process.argv[3] ?? 'reports/modules';
  if (!fs.existsSync(input)) {
    console.error(`No Cucumber JSON at ${input} — run the tests first.`);
    process.exit(1);
  }
  const summary = buildSummary(JSON.parse(fs.readFileSync(input, 'utf8')) as CucumberFeature[]);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(outDir, 'summary.md'), toMarkdown(summary));
  fs.writeFileSync(path.join(outDir, 'index.html'), toHtml(summary));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, toMarkdown(summary));
  }
  const { totals } = summary;
  console.log(
    `Modules: ${summary.modules.length} · scenarios: ${totals.scenarios} · passed: ${totals.passed} · failed: ${totals.failed} · skipped: ${totals.skipped}`,
  );
  if (process.argv.includes('--fail-on-failure') && (totals.failed > 0 || totals.scenarios === 0)) {
    process.exit(1);
  }
}

main();
