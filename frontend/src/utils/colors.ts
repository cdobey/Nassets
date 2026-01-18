export const CATEGORY_COLORS: Record<string, string> = {
  rent: '#ffd4e5',
  utilities: '#d4e5ff',
  food: '#ffe5d4',
  transport: '#e5d4ff',
  entertainment: '#d4ffe5',
  salary: '#c7f9cc',
  freelance: '#f9e5c7',
  investment: '#e5c7f9',
  default: '#f0f0f0',
};

export const getItemColor = (
  title: string,
  category: string | null | undefined,
  isRecurring: boolean
): string => {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lowerCategory.includes(key) || lowerTitle.includes(key)) {
      return color;
    }
  }

  return isRecurring ? '#e8f4f8' : CATEGORY_COLORS.default;
};
