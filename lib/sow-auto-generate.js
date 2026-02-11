/**
 * SOW Auto-Generation from Diagnostic Data
 *
 * Generates SOW sections from diagnostic processes + service catalog.
 * Groups actionable items by function, looks up hours/rates from catalog.
 */

/**
 * Generate SOW sections from diagnostic processes.
 *
 * @param {Array} processes - Diagnostic process objects
 * @param {Map<string, object>} catalogMap - Map of serviceId slug → service catalog entry
 * @returns {Array} Section objects ready for bulkCreateSections()
 */
export function generateSectionsFromDiagnostic(processes, catalogMap = new Map()) {
  // Filter to actionable items
  const actionable = processes.filter(
    p => p.status === 'warning' || p.status === 'unable' || p.addToEngagement
  );

  if (actionable.length === 0) return [];

  // Group by function (e.g., "Marketing", "Sales", "Cross Functional")
  const groups = {};
  for (const p of actionable) {
    const fn = p.function || 'General';
    if (!groups[fn]) groups[fn] = [];
    groups[fn].push(p);
  }

  const sections = [];
  let sortOrder = 0;

  for (const [functionName, items] of Object.entries(groups)) {
    let totalHoursLow = 0;
    let totalHoursHigh = 0;
    let rateSum = 0;
    let rateCount = 0;
    const allDeliverables = [];

    for (const item of items) {
      const service = item.serviceId ? catalogMap.get(item.serviceId) : null;
      if (service) {
        if (service.hours_low) totalHoursLow += service.hours_low;
        if (service.hours_high) totalHoursHigh += service.hours_high;
        if (service.default_rate) {
          rateSum += Number(service.default_rate);
          rateCount++;
        }
        // Collect deliverables from key_steps
        if (Array.isArray(service.key_steps)) {
          for (const step of service.key_steps) {
            if (typeof step === 'string' && !allDeliverables.includes(step)) {
              allDeliverables.push(step);
            }
          }
        }
      }
    }

    const avgRate = rateCount > 0 ? Math.round(rateSum / rateCount) : null;
    const estimatedHours = totalHoursLow > 0
      ? Math.round((totalHoursLow + totalHoursHigh) / 2)
      : null;

    const statusSummary = summarizeStatuses(items);

    sections.push({
      title: functionName,
      description: `${functionName} improvements: ${statusSummary}. Covers ${items.length} diagnostic item${items.length === 1 ? '' : 's'}.`,
      deliverables: allDeliverables.length > 0 ? allDeliverables : items.map(i => i.name),
      hours: estimatedHours,
      rate: avgRate,
      diagnosticItems: items.map(i => i.name),
      sortOrder: sortOrder++,
    });
  }

  return sections;
}

/**
 * Generate an executive summary from diagnostic data.
 */
export function generateExecutiveSummary(processes, customerName, diagnosticType, overallRating) {
  const total = processes.length;
  const warning = processes.filter(p => p.status === 'warning').length;
  const unable = processes.filter(p => p.status === 'unable').length;
  const careful = processes.filter(p => p.status === 'careful').length;
  const healthy = processes.filter(p => p.status === 'healthy').length;
  const priority = processes.filter(p => p.addToEngagement).length;

  const typeLabel = {
    gtm: 'GTM Operations',
    clay: 'Clay Enrichment & Automation',
    cpq: 'Quote-to-Cash',
  }[diagnosticType] || 'Operations';

  const ratingLabel = {
    critical: 'critical attention',
    warning: 'significant improvement',
    moderate: 'targeted optimization',
    healthy: 'fine-tuning',
  }[overallRating] || 'review';

  return `Based on a comprehensive ${typeLabel} diagnostic assessment of ${total} processes, ${customerName || 'the organization'} requires ${ratingLabel}. The assessment identified ${warning + unable} critical items (${warning} warning, ${unable} unable), ${careful} areas requiring caution, and ${healthy} healthy processes. ${priority} items have been flagged as priorities for the engagement scope.`;
}

function summarizeStatuses(items) {
  const counts = { warning: 0, unable: 0, careful: 0, healthy: 0 };
  items.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });

  const parts = [];
  if (counts.warning) parts.push(`${counts.warning} warning`);
  if (counts.unable) parts.push(`${counts.unable} unable`);
  if (counts.careful) parts.push(`${counts.careful} careful`);
  if (counts.healthy) parts.push(`${counts.healthy} healthy`);
  return parts.join(', ');
}
