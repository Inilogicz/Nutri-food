export function calculateSessionCost(minutes: number, ratePerMinute: number): number {
    return minutes * ratePerMinute;
  }
  
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }