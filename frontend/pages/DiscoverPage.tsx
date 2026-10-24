import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Heading,
  Hide,
  HStack,
  Show,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import FilterPanel from "../components/FilterPanel";
import GameCard from "../components/GameCard";
import SearchAutocomplete from "../components/SearchAutocomplete";
import { useCachedQuery } from "../lib/queryCache";
import { useRouter } from "../lib/useRouter";
import { getGames, getGenres, getPlatforms } from "../services/rawgService";
import type { DiscoverFilters, Game } from "../types/game";

const DEFAULT_FILTERS: DiscoverFilters = {
  search: "",
  genre: "",
  platform: "",
  ordering: "-rating",
  yearFrom: "",
  yearTo: "",
  minRating: 0,
  minCritic: 0,
  maxPlaytime: 0,
  page: 1,
};

function readFilters(search: string): DiscoverFilters {
  const params = new URLSearchParams(search);

  return {
    search: params.get("q") ?? "",
    genre: params.get("genre") ?? "",
    platform: params.get("platform") ?? "",
    ordering: params.get("sort") ?? DEFAULT_FILTERS.ordering,
    yearFrom: params.get("from") ?? "",
    yearTo: params.get("to") ?? "",
    minRating: Number(params.get("rating") ?? 0),
    minCritic: Number(params.get("critic") ?? 0),
    maxPlaytime: Number(params.get("hours") ?? 0),
    page: Math.max(1, Number(params.get("page") ?? 1)),
  };
}

function buildDiscoverUrl(filters: DiscoverFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.ordering !== DEFAULT_FILTERS.ordering) {
    params.set("sort", filters.ordering);
  }
  if (filters.yearFrom) params.set("from", filters.yearFrom);
  if (filters.yearTo) params.set("to", filters.yearTo);
  if (filters.minRating) params.set("rating", String(filters.minRating));
  if (filters.minCritic) params.set("critic", String(filters.minCritic));
  if (filters.maxPlaytime) params.set("hours", String(filters.maxPlaytime));
  if (filters.page > 1) params.set("page", String(filters.page));

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function getDateRange(filters: DiscoverFilters) {
  if (!filters.yearFrom && !filters.yearTo) return undefined;

  const firstYear = filters.yearFrom || "1980";
  const lastYear = filters.yearTo || String(new Date().getFullYear());
  return `${firstYear}-01-01,${lastYear}-12-31`;
}

function passesClientFilters(game: Game, filters: DiscoverFilters) {
  if (game.rating < filters.minRating) return false;

  if (
    filters.maxPlaytime &&
    game.playtime &&
    game.playtime > filters.maxPlaytime
  ) {
    return false;
  }

  return true;
}

export default function DiscoverPage() {
  const router = useRouter();
  const mobileFilters = useDisclosure();
  const filters = useMemo(() => readFilters(router.search), [router.search]);
  const [searchText, setSearchText] = useState(filters.search);

  const genresQuery = useCachedQuery("genres", getGenres, {
    ttlMs: 60 * 60_000,
  });
  const platformsQuery = useCachedQuery("platforms", getPlatforms, {
    ttlMs: 60 * 60_000,
  });

  const gamesQuery = useCachedQuery(
    `games:${router.search || "default"}`,
    () =>
      getGames({
        search: filters.search || undefined,
        genres: filters.genre || undefined,
        platforms: filters.platform || undefined,
        ordering: filters.ordering,
        dates: getDateRange(filters),
        metacritic: filters.minCritic
          ? `${filters.minCritic},100`
          : undefined,
        page: filters.page,
        page_size: 20,
      }),
    { ttlMs: 2 * 60_000 },
  );

  // RAWG handles most filters. Rating and playtime are trimmed here afterward.
  const visibleGames = (gamesQuery.data?.results ?? []).filter((game) =>
    passesClientFilters(game, filters),
  );

  const updateFilters = (changes: Partial<DiscoverFilters>) => {
    router.navigate(buildDiscoverUrl({ ...filters, ...changes }));
  };

  const resetFilters = () => {
    setSearchText("");
    router.navigate("/");
  };

  const submitSearch = () => {
    updateFilters({ search: searchText.trim(), page: 1 });
  };

  const closeMobileFilters = (action: () => void) => {
    action();
    mobileFilters.onClose();
  };

  return (
    <Container maxW="1500px" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading size="2xl">Find your next game</Heading>
          <Text color="gray.400" mt={2}>
            Search, filter, compare, track, and see how well each game matches
            what you want.
          </Text>
        </Box>

        <SearchAutocomplete
          value={searchText}
          onChange={setSearchText}
          onSubmit={submitSearch}
        />

        <Hide above="lg">
          <Button alignSelf="flex-start" onClick={mobileFilters.onOpen}>
            Filters
          </Button>
        </Hide>

        <Drawer
          isOpen={mobileFilters.isOpen}
          placement="left"
          onClose={mobileFilters.onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>Refine games</DrawerHeader>
            <DrawerBody>
              <FilterPanel
                filters={filters}
                genres={genresQuery.data?.results ?? []}
                platforms={platformsQuery.data?.results ?? []}
                onChange={(changes) =>
                  closeMobileFilters(() => updateFilters(changes))
                }
                onReset={() => closeMobileFilters(resetFilters)}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={8}>
          <Show above="lg">
            <GridItem>
              <Box
                position="sticky"
                top="96px"
                borderWidth="1px"
                borderRadius="xl"
                p={5}
              >
                <FilterPanel
                  filters={filters}
                  genres={genresQuery.data?.results ?? []}
                  platforms={platformsQuery.data?.results ?? []}
                  onChange={updateFilters}
                  onReset={resetFilters}
                />
              </Box>
            </GridItem>
          </Show>

          <GridItem minW={0}>
            {gamesQuery.error && (
              <Box py={8}>
                <Heading size="md">Could not load games</Heading>
                <Text color="red.300" mt={2}>
                  {gamesQuery.error.message}
                </Text>
                <Button mt={4} onClick={gamesQuery.refetch}>
                  Try again
                </Button>
              </Box>
            )}

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
              {gamesQuery.isLoading &&
                Array.from({ length: 9 }, (_, index) => (
                  <Skeleton key={index} height="360px" borderRadius="xl" />
                ))}

              {!gamesQuery.isLoading &&
                visibleGames.map((game) => (
                  <GameCard key={game.id} game={game} filters={filters} />
                ))}
            </SimpleGrid>

            {!gamesQuery.isLoading && visibleGames.length === 0 && (
              <Box py={14} textAlign="center">
                <Heading size="md">No games match these filters</Heading>
                <Text color="gray.400" mt={2}>
                  Lower the rating requirements or broaden the date, platform,
                  and playtime filters.
                </Text>
              </Box>
            )}

            <HStack justify="center" mt={8}>
              <Button
                isDisabled={filters.page <= 1}
                onClick={() => updateFilters({ page: filters.page - 1 })}
              >
                Previous
              </Button>
              <Button
                isDisabled={!gamesQuery.data?.next}
                onClick={() => updateFilters({ page: filters.page + 1 })}
              >
                Next
              </Button>
            </HStack>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
