export const formatName = (name: string) => {
  if (!name) return name;
  if (name.toLowerCase().includes('hcmc.duyvo')) return 'Duy Võ';
  if (name.includes('@')) return name.split('@')[0];
  return name;
};
