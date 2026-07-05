import { format as fnsFormat, parseISO, formatDistanceToNow } from 'date-fns';

export const dateUtils = {
  formatDate: (date: Date | string, formatString = 'dd MMM yyyy') => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return fnsFormat(d, formatString);
  },

  formatTime: (date: Date | string, formatString = 'hh:mm a') => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return fnsFormat(d, formatString);
  },

  timeAgo: (date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  },

  getCurrentIsoString: () => {
    return new Date().toISOString();
  },
};

export default dateUtils;
