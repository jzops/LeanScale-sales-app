export const power10Metrics = [
  {
    name: 'ARR',
    ableToReport: 'warning',
    statusAgainstPlan: 'warning',
    currentPerformance: null,
  },
  {
    name: 'Bookings',
    ableToReport: 'careful',
    statusAgainstPlan: 'careful',
    currentPerformance: null,
  },
  {
    name: 'Gross churn',
    ableToReport: 'warning',
    statusAgainstPlan: 'warning',
    currentPerformance: null,
  },
  {
    name: 'Gross retention',
    ableToReport: 'unable',
    statusAgainstPlan: 'unable',
    currentPerformance: null,
  },
  {
    name: 'MQL -> Opportunity conversion rate',
    ableToReport: 'healthy',
    statusAgainstPlan: 'careful',
    currentPerformance: null,
  },
  {
    name: 'MQL production',
    ableToReport: 'careful',
    statusAgainstPlan: 'careful',
    currentPerformance: null,
  },
  {
    name: 'Net retention',
    ableToReport: 'warning',
    statusAgainstPlan: 'warning',
    currentPerformance: null,
  },
  {
    name: 'Opportunity/Deal - CW cycle time',
    ableToReport: 'unable',
    statusAgainstPlan: 'unable',
    currentPerformance: null,
  },
  {
    name: 'Opportunity/Deal -> CW conversion rate',
    ableToReport: 'healthy',
    statusAgainstPlan: 'careful',
    currentPerformance: null,
  },
  {
    name: 'Pipeline production',
    ableToReport: 'careful',
    statusAgainstPlan: 'careful',
    currentPerformance: null,
  },
];

export const statusColors = {
  healthy: '#22c55e',
  careful: '#eab308',
  warning: '#ef4444',
  unable: '#1f2937',
};

export const statusLabels = {
  healthy: 'Healthy',
  careful: 'Careful',
  warning: 'Warning',
  unable: 'Unable to Report',
};

export const statusEmoji = {
  healthy: '🟢',
  careful: '🟡',
  warning: '🔴',
  unable: '⚫',
};
