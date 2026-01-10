/**
 * Date utility functions
 */

export class DateUtils {
  /**
   * Format date to ISO string
   */
  static toISO(date: Date | string): string {
    return new Date(date).toISOString();
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    return new Date(date) < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    return new Date(date) > new Date();
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date | string, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date | string): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date | string): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
