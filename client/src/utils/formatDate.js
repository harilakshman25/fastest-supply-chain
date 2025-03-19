// client/src/utils/formatDate.js

// Format date to locale string
export const formatDate = (date, includeTime = true, timeZone = 'Asia/Kolkata') => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  return new Date(date).toLocaleDateString(undefined, options);
};
  
  // Get relative time (e.g., "2 hours ago", "5 days ago")
  export const getRelativeTime = (date) => {
    const now = new Date();
    const pastDate = new Date(date);
    const diff = now - pastDate;
    
    // Convert time difference to minutes, hours, days
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(date, false);
    }
  };
  
  // Calculate time remaining
  export const getTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    if (diff <= 0) {
      return 'Due now';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };
  