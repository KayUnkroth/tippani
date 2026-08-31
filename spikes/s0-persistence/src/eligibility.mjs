// Eligibility is decided over the applicable catalog, not the executed slice.
// Missing applicable gates block eligibility. Gates belonging to another
// engine/backing-path configuration are reported as "Not applicable" and do
// not make an otherwise complete component ineligible.

import { applicableScenarioIds } from "./applicability.mjs";

export function gateSummary(run) {
  const applicable = new Set(
    run.applicableScenarioIds ||
    (run.configuration ? applicableScenarioIds(run.configuration) : run.catalog.map((item) => item.id)),
  );
  const absoluteCatalog = run.catalog.filter((scenario) => scenario.criterionType === "absolute");
  const applicableCatalog = absoluteCatalog.filter((scenario) => applicable.has(scenario.id));
  const byId = new Map(run.results.map((result) => [result.scenarioId, result]));

  const failed = [];
  const unresolved = [];
  const passed = [];
  const missing = [];
  const na = [];
  const notApplicable = [];

  for (const scenario of applicableCatalog) {
    const result = byId.get(scenario.id);
    if (!result) {
      missing.push(scenario);
    } else if (result.status === "Fail") {
      failed.push(result);
    } else if (result.status === "Pass") {
      passed.push(result);
    } else if (result.status === "N/A") {
      // A reviewer-approved contract-level exception is distinct from a gate
      // assigned to another configuration by the applicability matrix.
      na.push(result);
    } else {
      // Incomplete or Blocked.
      unresolved.push(result);
    }
  }

  for (const scenario of absoluteCatalog) {
    if (!applicable.has(scenario.id)) notApplicable.push(scenario);
  }

  const clean = failed.length === 0 && unresolved.length === 0 && missing.length === 0;
  const eligible = clean ? "Yes" : (failed.length ? "No" : "Incomplete");

  return {
    applicable: applicableCatalog,
    failed,
    unresolved,
    passed,
    missing,
    na,
    notApplicable,
    eligible,
  };
}
