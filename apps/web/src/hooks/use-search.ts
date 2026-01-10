import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchParams } from '@/lib/api/search.api';

// Query Keys
export const searchKeys = {
  all: ['search'] as const,
  results: (params: SearchParams) => [...searchKeys.all, 'results', params] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
};

// Main search hook
export function useSearch(params: SearchParams = {}) {
  return useQuery({
    queryKey: searchKeys.results(params),
    queryFn: () => searchApi.search(params),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get search suggestions for autocomplete
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => searchApi.autocomplete(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
