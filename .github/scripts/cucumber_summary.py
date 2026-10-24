"""Builds a per-module (per-feature) Markdown summary from a Cucumber JSON report."""
import json
import sys
from collections import OrderedDict


def scenario_status(scenario):
    statuses = [step.get("result", {}).get("status") for step in scenario.get("steps", [])]
    statuses += [hook.get("result", {}).get("status") for key in ("before", "after") for hook in scenario.get(key, [])]
    if any(s == "failed" for s in statuses):
        return "failed"
    if all(s == "passed" for s in statuses if s):
        return "passed"
    return "skipped"


def main(path, fail_on_failure=False):
    try:
        with open(path, encoding="utf-8") as fh:
            features = json.load(fh)
    except (OSError, ValueError):
        print("## Selenium results\n\nNo Cucumber JSON report was produced.")
        return
    modules = OrderedDict()
    for feature in features:
        counts = modules.setdefault(feature["name"], {"passed": 0, "failed": 0, "skipped": 0, "jira": ""})
        tags = [t["name"] for t in feature.get("tags", [])]
        counts["jira"] = next((t[1:] for t in tags if t.startswith("@IB-")), "")
        for element in feature.get("elements", []):
            if element.get("type") == "scenario":
                counts[scenario_status(element)] += 1
    total = {k: sum(m[k] for m in modules.values()) for k in ("passed", "failed", "skipped")}
    print("## Selenium Java BDD - results by module\n")
    print("| Module | Jira | Passed | Failed | Skipped |")
    print("|---|---|---|---|---|")
    for name, c in modules.items():
        print(f"| {name} | {c['jira']} | {c['passed']} | {c['failed']} | {c['skipped']} |")
    print(f"| **Total** | | **{total['passed']}** | **{total['failed']}** | **{total['skipped']}** |")
    print(f"::notice title=Selenium results::passed={total['passed']} failed={total['failed']} skipped={total['skipped']}", file=sys.stderr)
    if fail_on_failure and (total["failed"] or not modules):
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1], "--fail-on-failure" in sys.argv)
