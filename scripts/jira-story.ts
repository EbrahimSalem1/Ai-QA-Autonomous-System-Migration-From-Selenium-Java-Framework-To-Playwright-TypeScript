/**
 * Pulls a Jira user story into specs/jira/<KEY>.md so the AI agents (and humans) can analyse it offline.
 * Usage: tsx scripts/jira-story.ts IB-13 [IB-14 ...]   (needs JIRA_EMAIL + JIRA_API_TOKEN)
 */
import fs from 'node:fs';
import path from 'node:path';
import { jiraConfigFromEnv, jiraRequest } from './jira';

interface Issue {
  key: string;
  fields: {
    summary: string;
    description: string | null;
    labels: string[];
    status: { name: string };
    priority?: { name: string };
    parent?: { key: string };
  };
}

async function main(): Promise<void> {
  const keys = process.argv.slice(2);
  const config = jiraConfigFromEnv();
  if (!keys.length || !config) {
    console.error('Usage: JIRA_EMAIL=… JIRA_API_TOKEN=… tsx scripts/jira-story.ts IB-13 [IB-14 …]');
    process.exit(1);
  }
  fs.mkdirSync('specs/jira', { recursive: true });
  for (const key of keys) {
    // API v2 returns the description as plain wiki text, which is what the agents read best.
    const issue = await jiraRequest<Issue>(
      config,
      `/rest/api/2/issue/${key}?fields=summary,description,labels,status,priority,parent`,
    );
    const file = path.join('specs/jira', `${key}.md`);
    fs.writeFileSync(
      file,
      [
        `# ${issue.key} — ${issue.fields.summary}`,
        '',
        `- Status: ${issue.fields.status.name}`,
        `- Priority: ${issue.fields.priority?.name ?? 'n/a'}`,
        `- Epic: ${issue.fields.parent?.key ?? 'n/a'}`,
        `- Labels: ${issue.fields.labels.join(', ')}`,
        `- Link: ${config.baseUrl}/browse/${issue.key}`,
        '',
        issue.fields.description ?? '_No description_',
        '',
      ].join('\n'),
    );
    console.log(`Saved ${file}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
