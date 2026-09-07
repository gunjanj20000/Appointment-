export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  if (dateStr === todayStr) {
    return 'Today, ' + targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Check tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomYear = tomorrow.getFullYear();
  const tomMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;

  if (dateStr === tomorrowStr) {
    return 'Tomorrow, ' + targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return targetDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
