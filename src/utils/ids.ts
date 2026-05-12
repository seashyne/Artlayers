export const createId = (prefix: string): string => {
  const cryptoId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}_${cryptoId}`;
};
