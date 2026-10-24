import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";

import type { DiscoverFilters, Genre, Platform } from "../types/game";

interface Props {
  filters: DiscoverFilters;
  genres: Genre[];
  platforms: Platform[];
  onChange: (patch: Partial<DiscoverFilters>) => void;
  onReset: () => void;
}

export default function FilterPanel({
  filters,
  genres,
  platforms,
  onChange,
  onReset,
}: Props) {
  const updateFilter = (patch: Partial<DiscoverFilters>) => {
    onChange({ ...patch, page: 1 });
  };

  return (
    <Stack gap={4}>
      <Text fontWeight="700" fontSize="lg">
        Refine results
      </Text>

      <FormControl>
        <FormLabel>Genre</FormLabel>
        <Select
          value={filters.genre}
          onChange={(event) => updateFilter({ genre: event.target.value })}
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.slug}>
              {genre.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Platform</FormLabel>
        <Select
          value={filters.platform}
          onChange={(event) => updateFilter({ platform: event.target.value })}
        >
          <option value="">All platforms</option>
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Sort</FormLabel>
        <Select
          value={filters.ordering}
          onChange={(event) => updateFilter({ ordering: event.target.value })}
        >
          <option value="-rating">Highest rated</option>
          <option value="-metacritic">Highest critic score</option>
          <option value="-released">Newest</option>
          <option value="released">Oldest</option>
          <option value="name">Name A-Z</option>
        </Select>
      </FormControl>

      <HStack align="start">
        <FormControl>
          <FormLabel>From year</FormLabel>
          <Input
            type="number"
            min="1980"
            max="2100"
            value={filters.yearFrom}
            onChange={(event) => updateFilter({ yearFrom: event.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>To year</FormLabel>
          <Input
            type="number"
            min="1980"
            max="2100"
            value={filters.yearTo}
            onChange={(event) => updateFilter({ yearTo: event.target.value })}
          />
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>Minimum player rating</FormLabel>
        <Select
          value={filters.minRating}
          onChange={(event) =>
            updateFilter({ minRating: Number(event.target.value) })
          }
        >
          <option value="0">Any rating</option>
          <option value="3">3.0+</option>
          <option value="3.5">3.5+</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Minimum critic score</FormLabel>
        <Select
          value={filters.minCritic}
          onChange={(event) =>
            updateFilter({ minCritic: Number(event.target.value) })
          }
        >
          <option value="0">Any critic score</option>
          <option value="60">60+</option>
          <option value="70">70+</option>
          <option value="80">80+</option>
          <option value="90">90+</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Maximum playtime</FormLabel>
        <Select
          value={filters.maxPlaytime}
          onChange={(event) =>
            updateFilter({ maxPlaytime: Number(event.target.value) })
          }
        >
          <option value="0">Any length</option>
          <option value="10">Up to 10 hours</option>
          <option value="25">Up to 25 hours</option>
          <option value="50">Up to 50 hours</option>
          <option value="100">Up to 100 hours</option>
        </Select>
      </FormControl>

      <Button variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </Stack>
  );
}
