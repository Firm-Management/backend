export function getFinancialYearRange(financialYear?: string): {
  startOfFY: Date;
  endOfFY: Date;
} {
  let startYear: number;
  let endYear: number;

  if (financialYear) {
    const [start, end] = financialYear.split("-").map(Number);
    startYear = start;
    endYear = end;
  } else {
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth();
    startYear = month < 3 ? currentYear - 1 : currentYear;
    endYear = startYear + 1;
  }

  const startOfFY = new Date(`${startYear}-04-01T00:00:00.000Z`);
  const endOfFY = new Date(`${endYear}-03-31T23:59:59.999Z`);

  return { startOfFY, endOfFY };
}
