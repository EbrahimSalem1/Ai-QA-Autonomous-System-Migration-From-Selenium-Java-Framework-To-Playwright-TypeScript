/** Minimal Jira Cloud REST client used by CI (locally, Claude uses the Atlassian MCP server instead). */
export interface JiraConfig {
  baseUrl: string;
  email: string;
  token: string;
}

export function jiraConfigFromEnv(): JiraConfig | null {
  const baseUrl = process.env.JIRA_BASE_URL ?? 'https://ebrasalem93.atlassian.net';
  const email = process.env.JIRA_EMAIL ?? '';
  const token = process.env.JIRA_API_TOKEN ?? '';
  return email && token ? { baseUrl: baseUrl.replace(/\/$/, ''), email, token } : null;
}

export async function jiraRequest<T>(config: JiraConfig, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString('base64')}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Jira ${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
