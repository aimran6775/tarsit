/**
 * Query Optimization Utilities
 * Provides helpers for optimizing Prisma queries
 */
export class QueryOptimizer {
  /**
   * Select only necessary fields to reduce data transfer
   */
  static selectFields<T extends Record<string, any>>(
    fields: (keyof T)[],
  ): Record<string, boolean> {
    const select: Record<string, boolean> = {};
    fields.forEach((field) => {
      select[field as string] = true;
    });
    return select;
  }

  /**
   * Optimize pagination with cursor-based pagination for better performance
   */
  static getCursorPagination(cursor?: string, limit: number = 20) {
    return {
      take: limit + 1, // Fetch one extra to check if there's a next page
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    };
  }

  /**
   * Batch queries to avoid N+1 problems
   */
  static async batchLoad<T, K>(
    ids: K[],
    loader: (ids: K[]) => Promise<T[]>,
    keyExtractor: (item: T) => K,
  ): Promise<Map<K, T>> {
    if (ids.length === 0) {
      return new Map();
    }

    const items = await loader(ids);
    const map = new Map<K, T>();

    items.forEach((item) => {
      map.set(keyExtractor(item), item);
    });

    return map;
  }

  /**
   * Optimize includes to only fetch what's needed
   */
  static optimizeIncludes(include: Record<string, any>): Record<string, any> {
    const optimized: Record<string, any> = {};

    for (const key in include) {
      const value = include[key];
      
      if (value === true) {
        // If just true, keep it
        optimized[key] = true;
      } else if (typeof value === 'object') {
        // If object, recursively optimize
        optimized[key] = this.optimizeIncludes(value);
      } else if (value === false) {
        // Skip false values
        continue;
      }
    }

    return optimized;
  }
}
