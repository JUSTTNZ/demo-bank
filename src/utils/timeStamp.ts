// utils/timestampUtils.ts

/**
 * Unified timestamp formatting utility that handles timezones properly
 */
export class TimestampFormatter {
  private userTimezone: string;

  constructor(userTimezone?: string) {
    // Use provided timezone or detect from browser
    this.userTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Format timestamp with timezone awareness
   * @param timestamp - ISO string or Date object
   * @param targetTimezone - Optional specific timezone to format for
   */
  formatMessageTime(timestamp: string | Date, targetTimezone?: string): string {
    const date = new Date(timestamp);
    const timezone = targetTimezone || this.userTimezone;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const messageDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const currentDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    // Calculate difference in the target timezone
    const diffInMilliseconds = currentDate.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Format time options for the timezone
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: false // Use 24-hour format, change to true for 12-hour
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    };

    const weekdayOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      timeZone: timezone
    };

    // Same day
    if (diffInDays === 0) {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      return date.toLocaleTimeString([], timeOptions);
    }
    
    // Yesterday
    if (diffInDays === 1) {
      return `Yesterday ${date.toLocaleTimeString([], timeOptions)}`;
    }
    
    // This week (within 7 days)
    if (diffInDays < 7) {
      return `${date.toLocaleDateString([], weekdayOptions)} ${date.toLocaleTimeString([], timeOptions)}`;
    }
    
    // Older messages
    return `${date.toLocaleDateString([], dateOptions)} ${date.toLocaleTimeString([], timeOptions)}`;
  }

  /**
   * Format for detailed timestamp with full date and timezone info
   */
  formatDetailedTime(timestamp: string | Date, targetTimezone?: string): string {
    const date = new Date(timestamp);
    const timezone = targetTimezone || this.userTimezone;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    };

    return date.toLocaleString([], options);
  }

  /**
   * Get relative time (for admin dashboard - "5m ago", "2h ago", etc.)
   */
  getRelativeTime(timestamp: string | Date, targetTimezone?: string): string {
    const date = new Date(timestamp);
    const timezone = targetTimezone || this.userTimezone;
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const messageDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const currentDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    const diffInMinutes = Math.floor((currentDate.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    // For very old messages, show the actual date
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      timeZone: timezone 
    });
  }

  /**
   * Set user timezone (useful when user profile loads with timezone info)
   */
  setUserTimezone(timezone: string) {
    this.userTimezone = timezone;
  }

  /**
   * Get current user timezone
   */
  getUserTimezone(): string {
    return this.userTimezone;
  }
}

// Utility functions for getting user initials (used in both components)
export const getUserInitials = (fullName?: string | null): string => {
  if (!fullName || fullName.trim() === '') return 'U';
  
  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) return 'U';
  if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
  
  // Take first letter of first name and first letter of last name
  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
};

// Hook for React components to use timestamp formatting
export const useTimestampFormatter = (userTimezone?: string) => {
  const formatter = new TimestampFormatter(userTimezone);
  
  return {
    formatMessageTime: (timestamp: string | Date, timezone?: string) => 
      formatter.formatMessageTime(timestamp, timezone),
    formatDetailedTime: (timestamp: string | Date, timezone?: string) => 
      formatter.formatDetailedTime(timestamp, timezone),
    getRelativeTime: (timestamp: string | Date, timezone?: string) => 
      formatter.getRelativeTime(timestamp, timezone),
    setUserTimezone: (timezone: string) => formatter.setUserTimezone(timezone),
    getUserTimezone: () => formatter.getUserTimezone()
  };
};