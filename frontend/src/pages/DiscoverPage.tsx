import {
  Badge,
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
import { useMemo, useState, type ReactNode } from "react";
import { FiCompass, FiLayers, FiSearch, FiUsers } from "react-icons/fi";

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

  const visibleGames = (gamesQuery.data?.results ?? []).filter((game) =>
    passesClientFilters(game, filters),
  );
  const featuredGame = visibleGames.find((game) => game.background_image);
  const activeFilterCount = [
    filters.genre,
    filters.platform,
    filters.yearFrom,
    filters.yearTo,
    filters.minRating,
    filters.minCritic,
    filters.maxPlaytime,
  ].filter(Boolean).length;

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

  const heroBackground = featuredGame?.background_image
    ? `linear-gradient(90deg, rgba(5,8,17,.97) 0%, rgba(5,8,17,.82) 48%, rgba(5,8,17,.38) 100%), url("${featuredGame.background_image}")`
    : "linear-gradient(135deg, #0B1020 0%, #172554 55%, #312E81 100%)";

  return (
    <>
      <Box
        minH={{ base: "430px", md: "500px" }}
        display="flex"
        alignItems="center"
        bgImage={heroBackground}
        bgSize="cover"
        bgPosition="center"
        borderBottomWidth="1px"
        borderColor="borderSubtle"
      >
        <Container maxW="1500px" py={{ base: 12, md: 16 }}>
          <Stack maxW="780px" gap={6} color="white">
            <Badge
              alignSelf="flex-start"
              px={3}
              py={1.5}
              borderRadius="full"
              bg="whiteAlpha.200"
              color="white"
              backdropFilter="blur(10px)"
            >
              Powered by RAWG · Built for discovery
            </Badge>

            <Box>
              <Heading
                fontSize={{ base: "4xl", md: "6xl" }}
                lineHeight="0.98"
                letterSpacing="-0.045em"
                maxW="720px"
              >
                Find a game worth your next hundred hours.
              </Heading>
              <Text
                mt={5}
                fontSize={{ base: "md", md: "lg" }}
                color="whiteAlpha.800"
                maxW="650px"
                lineHeight="1.7"
              >
                Search, filter, compare, build your library, and use community
                reviews to narrow a huge catalog into games that actually fit
                what you want to play.
              </Text>
            </Box>

            <Box maxW="720px">
              <SearchAutocomplete
                value={searchText}
                onChange={setSearchText}
                onSubmit={submitSearch}
              />
            </Box>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
              <HeroStat icon={<FiSearch />} label="Search" value="Fast" />
              <HeroStat icon={<FiCompass />} label="Filters" value="Focused" />
              <HeroStat icon={<FiLayers />} label="Compare" value="Up to 3" />
              <HeroStat icon={<FiUsers />} label="Reviews" value="Community" />
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      <Container maxW="1500px" py={{ base: 7, md: 10 }}>
        <Stack gap={6}>
          <HStack justify="space-between" align="end" flexWrap="wrap" gap={4}>
            <Box>
              <Text
                color="brand.400"
                fontWeight="800"
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="0.12em"
              >
                Discover
              </Text>
              <Heading size="xl" mt={1}>
                {filters.search ? `Results for “${filters.search}”` : "Explore games"}
              </Heading>
              <Text color="textSecondary" mt={2}>
                {gamesQuery.isLoading
                  ? "Loading recommendations…"
                  : `${visibleGames.length} games on this page${activeFilterCount ? ` · ${activeFilterCount} active filters` : ""}`}
              </Text>
            </Box>

            <Hide above="lg">
              <Button onClick={mobileFilters.onOpen} colorScheme="brand">
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </Button>
            </Hide>
          </HStack>

          <Drawer
            isOpen={mobileFilters.isOpen}
            placement="left"
            onClose={mobileFilters.onClose}
          >
            <DrawerOverlay />
            <DrawerContent bg="surface" color="textPrimary">
              <DrawerHeader borderBottomWidth="1px" borderColor="borderSubtle">
                Refine games
              </DrawerHeader>
              <DrawerBody py={5}>
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

          <Grid templateColumns={{ base: "1fr", lg: "290px 1fr" }} gap={8}>
            <Show above="lg">
              <GridItem>
                <Box
                  position="sticky"
                  top="92px"
                  bg="surface"
                  borderWidth="1px"
                  borderColor="borderSubtle"
                  borderRadius="2xl"
                  p={5}
                  boxShadow="0 16px 45px rgba(5,10,25,.08)"
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
                <Box
                  py={8}
                  px={6}
                  bg="surface"
                  borderWidth="1px"
                  borderColor="borderSubtle"
                  borderRadius="2xl"
                >
                  <Heading size="md">Could not load games</Heading>
                  <Text color="red.400" mt={2}>
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
                    <Skeleton key={index} height="390px" borderRadius="2xl" />
                  ))}

                {!gamesQuery.isLoading &&
                  visibleGames.map((game) => (
                    <GameCard key={game.id} game={game} filters={filters} />
                  ))}
              </SimpleGrid>

              {!gamesQuery.isLoading && visibleGames.length === 0 && (
                <Box
                  py={14}
                  px={6}
                  textAlign="center"
                  bg="surface"
                  borderWidth="1px"
                  borderColor="borderSubtle"
                  borderRadius="2xl"
                >
                  <Heading size="md">No games match these filters</Heading>
                  <Text color="textSecondary" mt={2}>
                    Broaden the date, platform, rating, or playtime filters and
                    try again.
                  </Text>
                </Box>
              )}

              <HStack justify="center" mt={8}>
                <Button
                  variant="outline"
                  isDisabled={filters.page <= 1}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <Badge px={3} py={2} borderRadius="lg" colorScheme="blue">
                  Page {filters.page}
                </Badge>
                <Button
                  colorScheme="brand"
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
    </>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <HStack
      p={3}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      bg="blackAlpha.300"
      backdropFilter="blur(10px)"
    >
      <Box color="brand.300" fontSize="lg">
        {icon}
      </Box>
      <Stack gap={0}>
        <Text fontSize="xs" color="whiteAlpha.700">
          {label}
        </Text>
        <Text fontWeight="800" fontSize="sm">
          {value}
        </Text>
      </Stack>
    </HStack>
  );
}
