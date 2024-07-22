export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date);
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date);
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date);

  // Capitalize first letter of the month and take first 3 letters
  const month = mo.charAt(0).toUpperCase() + mo.slice(1, 3);

  // Correctly format year as 4 digits
  return `${parseInt(da, 10)} ${month}. ${ye}`;
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
