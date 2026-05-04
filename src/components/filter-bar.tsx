'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAudioStore } from '@/lib/audio-store';

type RevelationFilter = 'All' | 'Meccan' | 'Medinan';

const FILTERS: { label: string; value: RevelationFilter; count: number }[] = [
  { label: 'All', value: 'All', count: 114 },
  { label: 'Meccan', value: 'Meccan', count: 0 },
  { label: 'Medinan', value: 'Medinan', count: 0 },
];

export default function FilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    revelationFilter,
    setRevelationFilter,
    viewMode,
    setViewMode,
    meccanCount,
    medinanCount,
  } = useAudioStore();

  const filters = FILTERS.map((f) => ({
    ...f,
    count: f.value === 'All' ? 114 : f.value === 'Meccan' ? meccanCount : medinanCount,
  }));

  return (
    <div className="glass-sticky sticky top-0 z-30 py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search surah by name, meaning, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-[rgba(20,10,40,0.6)] border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-amber-500/40 focus:ring-amber-500/20"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={revelationFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRevelationFilter(filter.value)}
              className={
                revelationFilter === filter.value
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 gap-1.5 h-9'
                  : 'border-purple-500/20 bg-transparent text-muted-foreground hover:bg-purple-500/10 hover:text-purple-200 gap-1.5 h-9'
              }
            >
              {filter.label}
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] ${
                  revelationFilter === filter.value
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-purple-500/10 text-muted-foreground'
                }`}
              >
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-purple-500/20 rounded-lg p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === 'list'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-muted-foreground hover:text-purple-200'
            }`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === 'grid'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-muted-foreground hover:text-purple-200'
            }`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
