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
import { useCompare } from "../context/CompareContext";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import { getGame, getGames, getScreenshots } from "../services/rawgService";

export default function GameDetailPage({ gameId }: { gameId: number }) {
  const gameQuery = useCachedQuery(`game:${gameId}`, () => getGame(gameId), {
    ttlMs: 10 * 60_000,
  });
  const screenshots = useCachedQuery(
    `screenshots:${gameId}`,
    () => getScreenshots(gameId),
    { ttlMs: 10 * 60_000 },
  );

  const firstGenre = gameQuery.data?.genres?.[0]?.slug ?? "";
  const similar = useCachedQuery(
    `similar:${gameId}:${firstGenre}`,
    () =>
      getGames({
        genres: firstGenre,
        ordering: "-rating",
        page_size: 7,
      }),
    { enabled: Boolean(firstGenre), ttlMs: 10 * 60_000 },
  );

  const { games, toggle } = useCompare();
  const toast = useToast();

  if (gameQuery.isLoading) {
    return (
      <Container maxW="1200px" py={10}>
        <Skeleton height="500px" borderRadius="2xl" />
      </Container>
    );
  }

  if (gameQuery.error || !gameQuery.data) {
    return (
      <Container py={10}>
        <Stack>
          <Text color="red.300">
            {gameQuery.error?.message ?? "Game not found."}
          </Text>
          <Button alignSelf="flex-start" onClick={gameQuery.refetch}>
            Retry
          </Button>
        </Stack>
      </Container>
    );
  }

  const game = gameQuery.data;
  const selected = games.some((item) => item.id === game.id);

  return (
    <Container maxW="1200px" py={8}>
      <Stack gap={10}>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "minmax(0, 1.2fr) minmax(300px, .8fr)",
          }}
          gap={8}
          alignItems="start"
        >
          <GridItem>
            <Image
              src={game.background_image ?? "/gamefilter-logo.webp"}
              alt={`${game.name} artwork`}
              width="100%"
              maxH="560px"
              objectFit="cover"
              borderRadius="2xl"
            />
          </GridItem>

          <GridItem>
            <Stack gap={5}>
              <Box>
                <Heading size="2xl">{game.name}</Heading>
                <HStack mt={3} flexWrap="wrap">
                  {game.genres?.map((genre) => (
                    <Badge key={genre.id}>{genre.name}</Badge>
                  ))}
                </HStack>
              </Box>

              <SimpleGrid columns={2} spacing={3}>
                <Stat label="Critic" value={game.metacritic ?? "N/A"} />
                <Stat label="Players" value={`${game.rating.toFixed(1)}/5`} />
                <Stat label="Released" value={game.released ?? "TBA"} />
                <Stat
                  label="Playtime"
                  value={game.playtime ? `${game.playtime}h` : "N/A"}
                />
              </SimpleGrid>

              <Text color="gray.300" lineHeight="1.75">
                {game.description_raw ||
                  "No description is available for this game."}
              </Text>

              <Stack gap={2}>
                <MetadataLine
                  label="Platforms"
                  value={
                    game.parent_platforms
                      ?.map((item) => item.platform.name)
                      .join(", ") || "N/A"
                  }
                />
                <MetadataLine
                  label="Developers"
                  value={
                    game.developers?.map((item) => item.name).join(", ") ||
                    "N/A"
                  }
                />
                <MetadataLine
                  label="Publishers"
                  value={
                    game.publishers?.map((item) => item.name).join(", ") ||
                    "N/A"
                  }
                />
              </Stack>

              {game.stores?.length ? (
                <HStack flexWrap="wrap">
                  <Text fontWeight="700" fontSize="sm">
                    Stores:
                  </Text>
                  {game.stores.map((item) =>
                    item.store.domain ? (
                      <ChakraLink
                        key={item.store.id}
                        href={`https://${item.store.domain}`}
                        isExternal
                        color="green.300"
                        fontSize="sm"
                      >
                        {item.store.name} ↗
                      </ChakraLink>
                    ) : (
                      <Text key={item.store.id} fontSize="sm">
                        {item.store.name}
                      </Text>
                    ),
                  )}
                </HStack>
              ) : null}

              <LibraryControls game={game} />

              <Button
                variant={selected ? "solid" : "outline"}
                onClick={() => {
                  const message = toggle(game);
                  if (message) {
                    toast({ title: message, status: "warning" });
                  }
                }}
              >
                {selected
                  ? "Remove from comparison"
                  : "Add to comparison"}
              </Button>

              {game.website && (
                <ChakraLink href={game.website} isExternal color="green.300">
                  Official website ↗
                </ChakraLink>
              )}
            </Stack>
          </GridItem>
        </Grid>

        {(screenshots.data?.results.length ?? 0) > 0 && (
          <Box>
            <Heading size="lg" mb={4}>
              Screenshots
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {screenshots.data?.results.slice(0, 6).map((shot) => (
                <Image
                  key={shot.id}
                  src={shot.image}
                  alt={`${game.name} screenshot`}
                  borderRadius="xl"
                  aspectRatio={16 / 9}
                  objectFit="cover"
                  loading="lazy"
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {similar.data?.results.length ? (
          <Box>
            <Heading size="lg" mb={4}>
              You may also like
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              {similar.data.results
                .filter((item) => item.id !== game.id)
                .slice(0, 6)
                .map((item) => (
                  <Box
                    key={item.id}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                  >
                    <Image
                      src={item.background_image ?? "/gamefilter-logo.webp"}
                      alt={item.name}
                      aspectRatio={16 / 9}
                      objectFit="cover"
                      loading="lazy"
                    />
                    <Box p={3}>
                      <Text fontWeight="700" fontSize="sm">
                        <AppLink to={`/games/${item.id}/${item.slug}`}>
                          {item.name}
                        </AppLink>
                      </Text>
                    </Box>
                  </Box>
                ))}
            </SimpleGrid>
          </Box>
        ) : null}

        <Box>
          <Heading size="lg" mb={5}>
            Community reviews
          </Heading>
          <ReviewSection game={game} />
        </Box>
      </Stack>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Text
        fontSize="xs"
        textTransform="uppercase"
        color="gray.400"
        letterSpacing="wide"
      >
        {label}
      </Text>
      <Text fontSize="xl" fontWeight="800">
        {value}
      </Text>
    </Box>
  );
}

function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <Text fontSize="sm">
      <strong>{label}:</strong> {value}
    </Text>
  );
}
