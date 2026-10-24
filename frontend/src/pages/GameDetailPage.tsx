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
                <MetadataLine label="Platforms" value={platformNames} />
                <MetadataLine label="Developers" value={developerNames} />
                <MetadataLine label="Publishers" value={publisherNames} />
              </Stack>

              {game.stores?.length ? (
                <StoreLinks stores={game.stores} />
              ) : null}

              <LibraryControls game={game} />

              <Button variant={isSelected ? "solid" : "outline"} onClick={handleCompare}>
                {isSelected
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
                  borderRadius="xl"
                  aspectRatio={16 / 9}
                  objectFit="cover"
                  loading="lazy"
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {similarGames.length > 0 && (
          <Box>
            <Heading size="lg" mb={4}>
              You may also like
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              {similarGames.map((similarGame) => (
                <Box
                  key={similarGame.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Image
                    src={
                      similarGame.background_image ?? "/gamefilter-logo.webp"
                    }
                    alt={similarGame.name}
                    aspectRatio={16 / 9}
                    objectFit="cover"
                    loading="lazy"
                  />
                  <Box p={3}>
                    <Text fontWeight="700" fontSize="sm">
                      <AppLink
                        to={`/games/${similarGame.id}/${similarGame.slug}`}
                      >
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
  );
}

interface StatProps {
  label: string;
  value: string | number;
}

function Stat({ label, value }: StatProps) {
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

interface Store {
  store: {
    id: number;
    name: string;
    domain?: string;
  };
}

function StoreLinks({ stores }: { stores: Store[] }) {
  return (
    <HStack flexWrap="wrap">
      <Text fontWeight="700" fontSize="sm">
        Stores:
      </Text>
      {stores.map(({ store }) =>
        store.domain ? (
          <ChakraLink
            key={store.id}
            href={`https://${store.domain}`}
            isExternal
            color="green.300"
            fontSize="sm"
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
  );
}
