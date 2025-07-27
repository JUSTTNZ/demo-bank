// utils/formatters.ts

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Define an explicit translation object interface for greetings
interface GreetingTranslations {
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
}

export const getGreeting = (t: GreetingTranslations): string => {
  const hour = new Date().getHours();
  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
};
