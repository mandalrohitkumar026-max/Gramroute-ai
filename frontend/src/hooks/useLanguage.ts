import { useLanguage as useBaseLanguage } from '../contexts/LanguageContext';

/**
 * Enhanced internationalization hook providing translations and agricultural localized formatters
 */
export const useLanguage = () => {
  const lang = useBaseLanguage();

  /**
   * Formats numbers into Indian Rupee currency format (e.g. ₹1,850)
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Formats weight into kg or quintals depending on magnitude (1 Quintal = 100 kg)
   */
  const formatWeight = (weightKg: number): string => {
    if (weightKg >= 100) {
      const quintals = weightKg / 100;
      return `${quintals % 1 === 0 ? quintals : quintals.toFixed(1)} Quintals (${weightKg} kg)`;
    }
    return `${weightKg} kg`;
  };

  return {
    ...lang,
    formatCurrency,
    formatWeight
  };
};

export default useLanguage;
