export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date);
  const mo = new Intl.DateTimeFormat('fr', { month: '2-digit' }).format(date);
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date);

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
