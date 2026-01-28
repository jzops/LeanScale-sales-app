# Diagnostic Configuration

This file controls the diagnostic questionnaire and engagement overview. Edit the tables below to customize what appears in the portal.

## Processes (Strategic Projects)

Set `Include` to `✓` to add the process to the recommended engagement.

| Process | Status | Include | Function | Outcome | Metric | Service ID |
|---------|--------|---------|----------|---------|--------|------------|
| Activity Capture | warning | ✓ | Cross Functional | Improve Data Quality | Pipeline production | activity-capture |
| Automated Inbound Data Enrichment | warning | ✓ | Marketing | Improve Data Quality | MQL production | automated-inbound-data-enrichment |
| Customer Lifecycle (GTM Lifecycle) | warning | ✓ | Customer Success | Reduce Churn | Gross retention | customer-lifecycle |
| Forecasting Process Implementation | warning | ✓ | Sales | Optimize Reporting | Bookings | forecasting-process-implementation |
| Market Map | careful | ✓ | Marketing | Increase Pipeline | MQL production | market-map |
| Lead & Opportunity Attribution | careful | ✓ | Marketing | Optimize Reporting | MQL -> Opportunity conversion rate | lead-and-opportunity-attribution |
| Lead Lifecycle (GTM Lifecycle) | warning | ✓ | Marketing | Increase Pipeline | MQL -> Opportunity conversion rate | lead-lifecycle |
| Lead Routing | warning | ✓ | Sales | Improve Sales Efficiency | Opportunity/Deal - CW cycle time | lead-routing |
| Marketing-to-Sales Handoff & SLA Tracking | careful | ✓ | Cross Functional | Improve Sales Efficiency | Opportunity/Deal - CW cycle time | marketing-to-sales-handoff-and-sla-tracking |
| Sales Lifecycle (GTM Lifecycle) | unable | ✓ | Sales | Increase Pipeline | Pipeline production | sales-lifecycle |
| Sales Territory Design and System Implementation | careful | ✓ | Sales | Improve Sales Efficiency | Bookings | sales-territory-design |
| ABM / ABS Process and System | careful | | Marketing | Increase Pipeline | Pipeline production | abm-abs-process-and-system |
| AI Automated Inbound | careful | | Marketing | Scale Operations | MQL production | ai-automated-inbound |
| ARR Reporting | careful | | Cross Functional | Optimize Reporting | ARR | arr-reporting |
| Automated Outbound Process | unable | | Sales | Increase Pipeline | Pipeline production | automated-outbound-process |
| CLM Implementation | healthy | | Sales | Improve Sales Efficiency | Opportunity/Deal - CW cycle time | clm-implementation |
| Commission Tool Implementation | careful | | Sales | Scale Operations | Bookings | commission-tool-implementation |
| Conversation Intelligence Implementation | warning | | Sales | Improve Sales Efficiency | Opportunity/Deal -> CW conversion rate | conversation-intelligence-platform-implementation |
| CPQ Implementation | unable | | Sales | Improve Sales Efficiency | Opportunity/Deal - CW cycle time | cpq-implementation |
| CRM Deduplication | unable | | Cross Functional | Improve Data Quality | Pipeline production | crm-deduplication |
| CRM Deduplication Ongoing Tool | healthy | | Cross Functional | Improve Data Quality | Pipeline production | crm-deduplication-ongoing-tool |
| Customer Health Model | warning | | Customer Success | Reduce Churn | Gross churn | customer-health-model |
| Customer Segmentation | healthy | | Customer Success | Reduce Churn | Net retention | customer-segmentation |
| Customer Success Platform Implementation | careful | | Customer Success | Reduce Churn | Gross retention | customer-success-platform-implementation |
| E-Signature Implementation | healthy | | Sales | Improve Sales Efficiency | Opportunity/Deal - CW cycle time | e-signature-implementation |
| Email Operations: Nurture Program Build & Management | healthy | | Marketing | Increase Pipeline | MQL production | email-operations-nurture-program |
| Email Operations: Subscription & Compliance Framework | healthy | | Marketing | Scale Operations | MQL production | email-operations-subscription-and-compliance |
| Email Operations: Templates & Build Process | careful | | Marketing | Scale Operations | MQL production | email-operations-templates-and-build-process |
| Event Operations: Event Platform Implementation | warning | | Marketing | Increase Pipeline | MQL production | event-operations-platform-implementation |
| Event Operations: Lead List Intake Process | unable | | Marketing | Improve Data Quality | MQL production | event-operations-lead-list-intake-process |
| Executive Reporting Suite | careful | | Cross Functional | Optimize Reporting | ARR | executive-reporting-suite |
| Foundational Automations and Reporting Logic | warning | | Cross Functional | Scale Operations | Pipeline production | foundational-automations-and-reporting-logic |
| Growth Model | unable | | Cross Functional | Optimize Reporting | ARR | growth-model |
| GTM Lifecycle | healthy | | Cross Functional | Scale Operations | Pipeline production | gtm-lifecycle |
| Lead Scoring Model Design (Product-Led) | warning | | Marketing | Increase Pipeline | MQL -> Opportunity conversion rate | lead-scoring-model-product-led |
| Lead Scoring Model Design (Sales-Led) | unable | | Marketing | Increase Pipeline | MQL -> Opportunity conversion rate | lead-scoring-model-sales-led |
| Marketing Automation Platform Implementation | healthy | | Marketing | Scale Operations | MQL production | marketing-automation-platform-implementation |
| Marketing Database Segmentation | careful | | Marketing | Improve Data Quality | MQL production | marketing-database-segmentation |
| NPS and Voice of Customer Launch | warning | | Customer Success | Reduce Churn | Net retention | nps-and-voice-of-customer-launch |
| Physical Event Process and ROI Reporting | unable | | Marketing | Optimize Reporting | MQL production | physical-event-process-and-roi-reporting |
| PLG GTM Design | careful | | Cross Functional | Increase Pipeline | MQL -> Opportunity conversion rate | plg-gtm-design |
| Quotas and Target Setting | unable | | Sales | Optimize Reporting | Bookings | quotas-and-target-setting |
| Quote to Cash | healthy | | Sales | Improve Sales Efficiency | Opportunity/Deal -> CW conversion rate | quote-to-cash |
| Renewal Management | unable | | Customer Success | Reduce Churn | Gross retention | renewal-management |
| Renewal, Churn, NRR/GRR Reporting | healthy | | Customer Success | Optimize Reporting | Net retention | renewal-churn-nrr-grr-reporting |
| Revenue Intelligence Platform Implementation | careful | | Cross Functional | Optimize Reporting | Pipeline production | revenue-intelligence-platform-implementation |
| Sales Engagement Platform Implementation | careful | | Sales | Improve Sales Efficiency | Pipeline production | sales-engagement-platform-implementation |
| Webinar Operations: Platform Implementation | careful | | Marketing | Increase Pipeline | MQL production | webinar-operations-platform-implementation |
| Webinar Operations: Process Design | warning | | Marketing | Increase Pipeline | MQL production | webinar-operations-process-design |
| Win/Loss Analysis | warning | | Sales | Optimize Reporting | Opportunity/Deal -> CW conversion rate | win-loss-analysis |

## Tools

Set `Include` to `✓` to add the tool to the recommended engagement.

| Tool | Status | Include | Category | Service ID |
|------|--------|---------|----------|------------|
| Salesforce | careful | ✓ | CRM | salesforce |
| HubSpot CRM | healthy | | CRM | hubspot-crm |
| Apollo | warning | ✓ | Enrichment | apollo |
| ZoomInfo | careful | ✓ | Enrichment | zoominfo |
| Clay | warning | | Enrichment | clay |
| Clearbit | healthy | | Enrichment | clearbit |
| Marketo | careful | | Marketing Automation | marketo |
| HubSpot Marketing | warning | | Marketing Automation | hubspot-marketing |
| Pardot | careful | | Marketing Automation | pardot |
| Outreach | warning | | Sales Engagement | outreach |
| Salesloft | careful | | Sales Engagement | salesloft |
| Gong | healthy | | Conversation Intelligence | gong |
| Chorus | careful | | Conversation Intelligence | chorus |
| Clari | warning | | Revenue Intelligence | clari |
| LeanData | careful | | Lead Routing | leandata |
| Chili Piper | healthy | | Scheduling | chili-piper |
| Gainsight | careful | | Customer Success | gainsight |

## Managed Services

Set `Include` to `✓` to add the managed service to the recommended engagement.
Set `Hours/Month` to specify the estimated monthly hours for the service.

| Service | Status | Include | Hours/Month | Service ID |
|---------|--------|---------|-------------|------------|
| CRM Admin | careful | ✓ | 8 | crm-admin |
| Enrichment Tools Admin | warning | ✓ | 8 | enrichment-tools-admin |
| Ongoing Reporting | careful | ✓ | 8 | ongoing-reporting |
| Core RevOps | healthy | | 12 | core-revops |
| Marketing Tools Admin | healthy | | 8 | marketing-tools-admin |
| Marketing Ops Maintenance | careful | | 10 | marketing-ops-maintenance |
| Sales Ops | warning | | 10 | sales-ops |
| CS Ops | unable | | 8 | cs-ops |
| Deal Desk | healthy | | 6 | deal-desk |
| GTM Systems Admin | careful | | 12 | gtm-systems-admin |

## Status Legend

- `healthy` = 🟢 Good shape, operating well
- `careful` = 🟡 Needs attention, some issues
- `warning` = 🔴 Critical issues, needs immediate action
- `unable` = ⚫ Unable to report / not implemented

## How to Edit

1. Change `Status` to reflect current health (healthy, careful, warning, unable)
2. Add or remove `✓` in the `Include` column to control what appears in the engagement
3. Add new rows to include additional processes, tools, or managed services
4. All changes will automatically reflect in the Diagnostic and Engagement Overview pages
