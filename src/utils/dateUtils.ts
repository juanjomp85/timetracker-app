// Utilidades para manejo de fechas en zona horaria local

/**
 * Convierte una fecha a string en formato YYYY-MM-DD en zona horaria local
 * @param date - Fecha a convertir
 * @returns String en formato YYYY-MM-DD
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha a string en formato ISO pero en zona horaria local
 * @param date - Fecha a convertir
 * @returns String en formato ISO local
 */
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en zona horaria local
 * @returns String en formato YYYY-MM-DD
 */
export const getTodayLocal = (): string => {
  return toLocalDateString(new Date());
};

/**
 * Convierte un string de fecha YYYY-MM-DD a objeto Date en zona horaria local
 * @param dateString - String en formato YYYY-MM-DD
 * @returns Objeto Date
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
