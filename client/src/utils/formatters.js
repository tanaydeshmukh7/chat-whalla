/**
 * Format a date to a human-readable time (e.g., "10:30 PM")
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a date for the chat list (Today, Yesterday, or date)
 */
export const formatChatListDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return formatTime(date);
  }

  if (diff < 2 * oneDay && d.getDate() === now.getDate() - 1) {
    return 'Yesterday';
  }

  if (diff < 7 * oneDay) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Format last seen time
 */
export const formatLastSeen = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const oneMin = 60 * 1000;
  const oneHour = 60 * oneMin;
  const oneDay = 24 * oneHour;

  if (diff < oneMin) return 'just now';
  if (diff < oneHour) return `${Math.floor(diff / oneMin)} min ago`;
  if (diff < oneDay) return `today at ${formatTime(date)}`;
  if (diff < 2 * oneDay) return `yesterday at ${formatTime(date)}`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ` at ${formatTime(date)}`;
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Simple formatting: +91 XXXXX XXXXX
  if (phone.length === 13 && phone.startsWith('+91')) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
