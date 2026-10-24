---
name: <kebab-case-skill-name>
description: <One sentence — when Claude should use this skill. Mention the trigger words a user would type.>
---

# <Skill title>

## When to use
- <Trigger 1, e.g. "a Jira story key is mentioned">
- <Trigger 2>

## Inputs
| Input | Where it comes from |
|---|---|
| <e.g. Jira key> | <user message / Atlassian MCP / file> |

## Steps
1. <Concrete action, with the tool to use (MCP tool, npm script, agent)>
2. <…>
3. <Verification step — how to prove the step worked>

## Output
- <Files created/changed and their location>
- <What to report back to the user>

## Rules
- <Project convention that must hold, e.g. "no assertions in page objects">

## Example
<Short, real example of input → output>
