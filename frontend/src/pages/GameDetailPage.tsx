import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Link as ChakraLink,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import LibraryControls from "../components/LibraryControls";
import ReviewSection from "../components/ReviewSection";
import { useCompare } from "../context/useCompare";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import { getGame, getGames, getScreenshots } from "../services/rawgService";

interface Props {
  gameId: number;
}

export default function GameDetailPage({ gameId }: Props) {
  const toast = useToast();
  const { games: comparedGames, toggle } = useCompare();

  const gameQuery = useCachedQuery(`game:${gameId}`, () => getGame(gameId), {
    ttlMs: 10 * 60_000,
  });
  const screenshotsQuery = useCachedQuery(
    `screenshots:${gameId}`,
    () => getScreenshots(gameId),
    { ttlMs: 10 * 60_000 },
  );

  const firstGenre = gameQuery.data?.genres?.[0]?.slug ?? "";
  const similarQuery = useCachedQuery(
    `similar:${gameId}:${firstGenre}`,
    () =>
      getGames({
        genres: firstGenre,
        ordering: "-rating",
        page_size: 7,
      }),
    {
      enabled: Boolean(firstGenre),
      ttlMs: 10 * 60_000,
    },
  );

  if (gameQuery.isLoading) {
    return (
      <Container maxW="1200px" py={10}>
        <Skeleton height="560px" borderRadius="3xl" />
      </Container>
    );
  }

  if (gameQuery.error || !gameQuery.data) {
    return (
      <Container maxW="900px" py={12}>
        <Box
          bg="surface"
          borderWidth="1px"
          borderColor="borderSubtle"
          borderRadius="2xl"
          p={7}
        >
          <Stack>
            <Text color="red.400">
              {gameQuery.error?.message ?? "Game not found."}
            </Text>
            <Button alignSelf="flex-start" onClick={gameQuery.refetch}>
              Retry
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  const game = gameQuery.data;
  const isSelected = comparedGames.some((item) => item.id === game.id);
  const platformNames =
    game.parent_platforms?.map(({ platform }) => platform.name).join(", ") ||
    "N/A";
  const developerNames =
    game.developers?.map((developer) => developer.name).join(", ") || "N/A";
  const publisherNames =
    game.publishers?.map((publisher) => publisher.name).join(", ") || "N/A";

  const handleCompare = () => {
    const message = toggle(game);
    if (message) {
      toast({ title: message, status: "warning" });
    }
  };

  const screenshots = screenshotsQuery.data?.results.slice(0, 6) ?? [];
  const similarGames =
    similarQuery.data?.results
      .filter((item) => item.id !== game.id)
      .slice(0, 6) ?? [];

  const heroBackground = game.background_image
    ? `linear-gradient(90deg, rgba(5,8,17,.96), rgba(5,8,17,.68) 55%, rgba(5,8,17,.35)), url("${game.background_image}")`
    : "linear-gradient(135deg, #0B1020, #172554, #312E81)";

  return (
    <>
      <Box
        minH={{ base: "420px", md: "520px" }}
        display="flex"
        alignItems="end"
        bgImage={heroBackground}
        bgSize="cover"
        bgPosition="center"
        borderBottomWidth="1px"
        borderColor="borderSubtle"
      >
        <Container maxW="1200px" py={{ base: 10, md: 14 }}>
          <Stack maxW="760px" gap={5} color="white">
            <HStack flexWrap="wrap">
              {game.genres?.map((genre) => (
                <Badge
                  key={genre.id}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  color="white"
                >
                  {genre.name}
                </Badge>
              ))}
            </HStack>

            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
              lineHeight="1"
              letterSpacing="-0.045em"
            >
              {game.name}
            </Heading>

            <HStack flexWrap="wrap" gap={3}>
              <HeroMetric label="Players" value={`${game.rating.toFixed(1)}/5`} />
              <HeroMetric label="Critic" value={String(game.metacritic ?? "N/A")} />
              <HeroMetric label="Released" value={game.released ?? "TBA"} />
              <HeroMetric
                label="Playtime"
                value={game.playtime ? `${game.playtime}h` : "N/A"}
              />
            </HStack>
          </Stack>
        </Container>
      </Box>

      <Container maxW="1200px" py={{ base: 8, md: 12 }}>
        <Stack gap={10}>
          <Grid
            templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 340px" }}
            gap={8}
            alignItems="start"
          >
            <GridItem>
              <Stack gap={7}>
                <Box
                  bg="surface"
                  borderWidth="1px"
                  borderColor="borderSubtle"
                  borderRadius="2xl"
                  p={{ base: 5, md: 7 }}
                >
                  <Heading size="lg" mb={4}>
                    About this game
                  </Heading>
                  <Text color="textSecondary" lineHeight="1.85">
                    {game.description_raw ||
                      "No description is available for this game."}
                  </Text>
                </Box>

                {screenshots.length > 0 && (
                  <Box>
                    <Heading size="lg" mb={4}>
                      Screenshots
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {screenshots.map((screenshot) => (
                        <Image
                          key={screenshot.id}
                          src={screenshot.image}
                          alt={`${game.name} screenshot`}
                          borderRadius="2xl"
                          aspectRatio={16 / 9}
                          width="100%"
                          objectFit="cover"
                          loading="lazy"
                          borderWidth="1px"
                          borderColor="borderSubtle"
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </Stack>
            </GridItem>

            <GridItem>
              <Stack
                position={{ lg: "sticky" }}
                top={{ lg: "96px" }}
                bg="surface"
                borderWidth="1px"
                borderColor="borderSubtle"
                borderRadius="2xl"
                p={5}
                gap={5}
              >
                <Box>
                  <Text
                    color="brand.400"
                    fontWeight="800"
                    fontSize="xs"
                    letterSpacing="0.12em"
                  >
                    GAME DETAILS
                  </Text>
                  <Heading size="md" mt={1}>
                    At a glance
                  </Heading>
                </Box>

                <Stack gap={3}>
                  <MetadataLine label="Platforms" value={platformNames} />
                  <MetadataLine label="Developers" value={developerNames} />
                  <MetadataLine label="Publishers" value={publisherNames} />
                </Stack>

                {game.stores?.length ? <StoreLinks stores={game.stores} /> : null}

                <LibraryControls game={game} />

                <Button
                  colorScheme="brand"
                  variant={isSelected ? "solid" : "outline"}
                  onClick={handleCompare}
                >
                  {isSelected ? "Remove from comparison" : "Add to comparison"}
                </Button>

                {game.website && (
                  <ChakraLink href={game.website} isExternal color="linkColor" fontWeight="700">
                    Official website ↗
                  </ChakraLink>
                )}
              </Stack>
            </GridItem>
          </Grid>

          {similarGames.length > 0 && (
            <Box>
              <Heading size="lg" mb={4}>
                You may also like
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                {similarGames.map((similarGame) => (
                  <Box
                    key={similarGame.id}
                    bg="surface"
                    borderWidth="1px"
                    borderColor="borderSubtle"
                    borderRadius="xl"
                    overflow="hidden"
                    transition="transform .2s ease, border-color .2s ease"
                    _hover={{ transform: "translateY(-3px)", borderColor: "brand.400" }}
                  >
                    <Image
                      src={similarGame.background_image ?? "/gamemaster-logo.webp"}
                      alt={similarGame.name}
                      aspectRatio={16 / 9}
                      width="100%"
                      objectFit="cover"
                      loading="lazy"
                    />
                    <Box p={3}>
                      <Text fontWeight="800" fontSize="sm" noOfLines={2}>
                        <AppLink to={`/games/${similarGame.id}/${similarGame.slug}`}>
                          {similarGame.name}
                        </AppLink>
                      </Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          <Box>
            <Heading size="lg" mb={5}>
              Community reviews
            </Heading>
            <ReviewSection game={game} />
          </Box>
        </Stack>
      </Container>
    </>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box
      px={3.5}
      py={2.5}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      bg="blackAlpha.400"
      backdropFilter="blur(10px)"
    >
      <Text fontSize="xs" color="whiteAlpha.700">
        {label}
      </Text>
      <Text fontWeight="900">{value}</Text>
    </Box>
  );
}

function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="700" mt={0.5}>
        {value}
      </Text>
    </Box>
  );
}

interface Store {
  store: {
    id: number;
    name: string;
    domain?: string;
  };
}

function StoreLinks({ stores }: { stores: Store[] }) {
  return (
    <Box>
      <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wide">
        Stores
      </Text>
      <HStack flexWrap="wrap" mt={1}>
        {stores.map(({ store }) =>
          store.domain ? (
            <ChakraLink
              key={store.id}
              href={`https://${store.domain}`}
              isExternal
              color="linkColor"
              fontSize="sm"
              fontWeight="700"
            >
              {store.name} ↗
            </ChakraLink>
          ) : (
            <Text key={store.id} fontSize="sm">
              {store.name}
            </Text>
          ),
        )}
      </HStack>
    </Box>
  );
}
