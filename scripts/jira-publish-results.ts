/**
 * Posts each module's latest CI result as a comment on its Jira story (closing the
 * Jira → tests → pipeline → Jira loop). Reads reports/modules/summary.json from module-report.ts.
 * Skips silently when JIRA_EMAIL / JIRA_API_TOKEN are not configured.
 */
import fs from 'node:fs';
import { jiraConfigFromEnv, jiraRequest } from './jira';
import type { Summary } from './module-report';

async function main(): Promise<void> {
  const config = jiraConfigFromEnv();
  if (!config) {
    console.log('Jira credentials not configured — skipping result publishing.');
    return;
  }
  const summary = JSON.parse(fs.readFileSync('reports/modules/summary.json', 'utf8')) as Summary;
  for (const module of summary.modules.filter((m) => m.jira)) {
    const verdict = module.failed ? '(x) FAILED' : '(/) PASSED';
    const lines = module.scenarios.map(
      (s) => `| ${s.status === 'passed' ? '(/)' : s.status === 'failed' ? '(x)' : '(?)'} | ${s.name} | ${s.status} |`,
    );
    const body = [
      `*Automated regression ${verdict}* — ${module.passed}/${module.scenarios.length} scenarios passed`,
      `Feature: {{features/${module.feature}}} · Target: {{${summary.target}}}`,
      summary.runUrl ? `CI run: [${summary.runUrl}|${summary.runUrl}]` : '',
      '',
      '|| ||Scenario||Result||',
      ...lines,
    ]
      .filter(Boolean)
      .join('\n');
    await jiraRequest(config, `/rest/api/2/issue/${module.jira}/comment`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    console.log(`Commented on ${module.jira}: ${verdict}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
