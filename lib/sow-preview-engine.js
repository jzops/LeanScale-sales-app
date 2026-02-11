/**
 * SOW Preview Engine — lightweight client-side SOW calculator
 *
 * Pure function, no Supabase dependency. Takes processes + static catalog data
 * and returns a preview of what the auto-generated SOW would look like.
 */

import { strategicProjects, functionLabels } from '../data/services-catalog';
import { TIERS, filterPriorityItems, enrichWithCatalog } from './engagement-engine';
import { selectPriorityItems, groupItems, shouldUseItemSections } from './sow-auto-builder';

/**
 * Build a flat array of catalog-like entries from the static services-catalog data
 * so enrichWithCatalog can match against them.
 */
function buildStaticCatalog() {
  const catalog = [];
  for (const [funcKey, services] of Object.entries(strategicProjects)) {
    const funcLabel = functionLabels[funcKey] || funcKey;
    for (const svc of services) {
      catalog.push({
        id: svc.id,
        name: svc.name,
        slug: svc.id,
        description: svc.description,
        primary_function: funcLabel,
        // Static estimates — these would normally come from DB
        hours_low: 30,
        hours_high: 60,
        default_rate: 200,
        key_steps: [],
      });
    }
  }
  return catalog;
}

const STATIC_CATALOG = buildStaticCatalog();

/**
 * Compute a SOW preview from current diagnostic processes
 *
 * @param {Array} processes - current diagnostic processes array
 * @param {Array} [serviceCatalog] - optional DB catalog entries; falls back to static
 * @returns {Object} preview result
 */
export function computeSowPreview(processes, serviceCatalog) {
  const catalog = serviceCatalog && serviceCatalog.length > 0
    ? serviceCatalog
    : STATIC_CATALOG;

  // 1. Select priority items (warning/unable OR addToEngagement)
  const priorityItems = selectPriorityItems(processes || []);

  if (priorityItems.length === 0) {
    return {
      sections: [],
      totalHoursLow: 0,
      totalHoursHigh: 0,
      estimatedInvestmentLow: 0,
      estimatedInvestmentHigh: 0,
      recommendedTier: TIERS[0],
      itemCount: 0,
      sectionCount: 0,
    };
  }

  // 2. Enrich with catalog data for hours/rates
  const enriched = enrichWithCatalog(priorityItems, catalog);

  // 3. Compute totals
  const totalHoursLow = enriched.reduce((sum, p) => sum + (p.hoursLow || 30), 0);
  const totalHoursHigh = enriched.reduce((sum, p) => sum + (p.hoursHigh || 60), 0);
  const avgRate = enriched.length > 0
    ? enriched.reduce((sum, p) => sum + (parseFloat(p.rate) || 200), 0) / enriched.length
    : 200;

  const estimatedInvestmentLow = Math.round(totalHoursLow * avgRate);
  const estimatedInvestmentHigh = Math.round(totalHoursHigh * avgRate);

  // 4. Determine sections — mirror auto-builder logic
  let sections;
  if (shouldUseItemSections(priorityItems)) {
    // One section per item
    sections = priorityItems.map(item => ({
      title: item.name,
      itemCount: 1,
      function: item.function || 'Other',
    }));
  } else {
    // Grouped by function
    const grouped = groupItems(priorityItems, 'function');
    sections = Object.entries(grouped).map(([fn, items]) => ({
      title: `${fn} — GTM Operations`,
      itemCount: items.length,
      function: fn,
    }));
  }

  // 5. Recommend tier
  const avgHours = Math.round((totalHoursLow + totalHoursHigh) / 2);
  const recommendedTier = TIERS.find(tier => {
    const monthsNeeded = avgHours / tier.hours;
    return monthsNeeded <= 6;
  }) || TIERS[TIERS.length - 1];

  return {
    sections,
    totalHoursLow,
    totalHoursHigh,
    estimatedInvestmentLow,
    estimatedInvestmentHigh,
    recommendedTier,
    itemCount: priorityItems.length,
    sectionCount: sections.length,
  };
}
