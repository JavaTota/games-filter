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
import { useRouter } from "../lib/router";
import { getGames, getGenres, getPlatforms } from "../services/rawgService";
import type { DiscoverFilters } from "../types/game";

const defaults: DiscoverFilters = {
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

/** URL state makes searches bookmarkable, shareable, and browser-navigation friendly. */
function readFilters(search: string): DiscoverFilters {
  const params = new URLSearchParams(search);

  return {
    search: params.get("q") ?? "",
    genre: params.get("genre") ?? "",
    platform: params.get("platform") ?? "",
    ordering: params.get("sort") ?? "-rating",
    yearFrom: params.get("from") ?? "",
    yearTo: params.get("to") ?? "",
    minRating: Number(params.get("rating") ?? 0),
    minCritic: Number(params.get("critic") ?? 0),
    maxPlaytime: Number(params.get("hours") ?? 0),
    page: Math.max(1, Number(params.get("page") ?? 1)),
  };
}

function toUrl(filters: DiscoverFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.ordering !== defaults.ordering) params.set("sort", filters.ordering);
  if (filters.yearFrom) params.set("from", filters.yearFrom);
  if (filters.yearTo) params.set("to", filters.yearTo);
  if (filters.minRating) params.set("rating", String(filters.minRating));
  if (filters.minCritic) params.set("critic", String(filters.minCritic));
  if (filters.maxPlaytime) params.set("hours", String(filters.maxPlaytime));
  if (filters.page > 1) params.set("page", String(filters.page));

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function DiscoverPage() {
  const router = useRouter();
  const filters = useMemo(() => readFilters(router.search), [router.search]);
  const [searchText, setSearchText] = useState(filters.search);
  const mobileFilters = useDisclosure();

  const genres = useCachedQuery("genres", getGenres, {
    ttlMs: 60 * 60_000,
  });
  const platforms = useCachedQuery("platforms", getPlatforms, {
    ttlMs: 60 * 60_000,
  });

  const dates =
    filters.yearFrom || filters.yearTo
      ? `${filters.yearFrom || "1980"}-01-01,${
          filters.yearTo || new Date().getFullYear()
        }-12-31`
      : undefined;

  const queryKey = `games:${router.search || "default"}`;
  const games = useCachedQuery(
    queryKey,
    () =>
      getGames({
        search: filters.search || undefined,
        genres: filters.genre || undefined,
        platforms: filters.platform || undefined,
        ordering: filters.ordering,
        dates,
        metacritic: filters.minCritic
          ? `${filters.minCritic},100`
          : undefined,
        page: filters.page,
        page_size: 20,
      }),
    { ttlMs: 2 * 60_000 },
  );

  // RAWG does not expose every filter server-side, so small result refinements stay client-side.
  const visibleGames = (games.data?.results ?? []).filter(
    (game) =>
      game.rating >= filters.minRating &&
      (!filters.maxPlaytime ||
        !game.playtime ||
        game.playtime <= filters.maxPlaytime),
  );

  const patchFilters = (change: Partial<DiscoverFilters>) => {
    router.navigate(toUrl({ ...filters, ...change }));
  };

  const resetFilters = () => {
    setSearchText("");
    router.navigate("/");
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
          onSubmit={() =>
            patchFilters({ search: searchText.trim(), page: 1 })
          }
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
                genres={genres.data?.results ?? []}
                platforms={platforms.data?.results ?? []}
                onChange={(change) => {
                  patchFilters(change);
                  mobileFilters.onClose();
                }}
                onReset={() => {
                  resetFilters();
                  mobileFilters.onClose();
                }}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Grid
          templateColumns={{ base: "1fr", lg: "260px minmax(0, 1fr)" }}
          gap={8}
        >
          <Show above="lg">
            <GridItem>
              <Box
                borderWidth="1px"
                borderRadius="xl"
                p={5}
                position="sticky"
                top="92px"
              >
                <FilterPanel
                  filters={filters}
                  genres={genres.data?.results ?? []}
                  platforms={platforms.data?.results ?? []}
                  onChange={patchFilters}
                  onReset={resetFilters}
                />
              </Box>
            </GridItem>
          </Show>

          <GridItem>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="700">
                {games.data?.count
                  ? `${games.data.count.toLocaleString()} matching games`
                  : "Game results"}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Page {filters.page}
              </Text>
            </HStack>

            {games.error && (
              <HStack>
                <Text color="red.300">{games.error.message}</Text>
                <Button size="sm" onClick={games.refetch}>
                  Retry
                </Button>
              </HStack>
            )}

            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={6}>
              {games.isLoading &&
                Array.from({ length: 9 }, (_, index) => (
                  <Skeleton
                    key={index}
                    height="360px"
                    borderRadius="xl"
                  />
                ))}

              {!games.isLoading &&
                visibleGames.map((game) => (
                  <GameCard key={game.id} game={game} filters={filters} />
                ))}
            </SimpleGrid>

            {!games.isLoading && visibleGames.length === 0 && (
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
                onClick={() => patchFilters({ page: filters.page - 1 })}
              >
                Previous
              </Button>
              <Button
                isDisabled={!games.data?.next}
                onClick={() => patchFilters({ page: filters.page + 1 })}
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
