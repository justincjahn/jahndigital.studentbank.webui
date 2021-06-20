const Period: { [key in Required<PeriodStrings>]: string } = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Yearly',
  ANNUALLY: 'Annually',
};

export default Period;
