// Function to format a date string into a standardized format ISO 8601 (YYYY-MM-DD)
export const formatDate = (dateStr) => {
  const date = new Date(dateStr); // Create a Date object from the provided date string

  // Format the year as a 4-digit number
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date);

  // Format the month as a 2-digit number (e.g., "01" for January, "12" for December)
  const mo = new Intl.DateTimeFormat('fr', { month: '2-digit' }).format(date);

  // Format the day as a 2-digit number (e.g., "01", "15")
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date);

  // Return the formatted date in the ISO 8601 format (YYYY-MM-DD)
  return `${ye}-${mo}-${da}`;
};

export const formatStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'accepted':
      return 'Accepté';
    case 'refused':
      return 'Refused';
  }
};
