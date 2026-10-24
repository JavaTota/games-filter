import {
  Box,
  Button,
  Container,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { useCompare } from "../context/useCompare";
import { AppLink } from "../lib/router";

export default function ComparePage() {
  const { games, clear } = useCompare();

  if (games.length === 0) {
    return (
      <Container py={16} textAlign="center">
        <Heading>No games selected</Heading>
        <Text mt={3} color="gray.400">
          Choose up to three games from Discover or a game detail page.
        </Text>
        <Button as="span" mt={5} colorScheme="green">
          <AppLink to="/">Discover games</AppLink>
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading>Compare games</Heading>
          <Text color="gray.400" mt={2}>
            A side-by-side view makes tradeoffs easier to see.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: games.length }} spacing={4}>
          {games.map((game) => (
            <Box
              key={game.id}
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
            >
              <Image
                src={game.background_image ?? "/gamefilter-logo.webp"}
                alt={game.name}
                aspectRatio={16 / 9}
                objectFit="cover"
              />
              <Box p={4}>
                <Heading size="md">
                  <AppLink to={`/games/${game.id}/${game.slug}`}>
                    {game.name}
                  </AppLink>
                </Heading>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Metric</Th>
                {games.map((game) => (
                  <Th key={game.id}>{game.name}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              <ComparisonRow
                label="Player rating"
                values={games.map((game) => `${game.rating.toFixed(1)}/5`)}
              />
              <ComparisonRow
                label="Critic score"
                values={games.map((game) => game.metacritic ?? "N/A")}
              />
              <ComparisonRow
                label="Released"
                values={games.map((game) => game.released ?? "TBA")}
              />
              <ComparisonRow
                label="Playtime"
                values={games.map((game) =>
                  game.playtime ? `${game.playtime}h` : "N/A",
                )}
              />
              <ComparisonRow
                label="Genres"
                values={games.map(
                  (game) =>
                    game.genres?.map((genre) => genre.name).join(", ") || "N/A",
                )}
              />
            </Tbody>
          </Table>
        </Box>

        <Button alignSelf="flex-start" variant="outline" onClick={clear}>
          Clear comparison
        </Button>
      </Stack>
    </Container>
  );
}

interface ComparisonRowProps {
  label: string;
  values: (string | number)[];
}

function ComparisonRow({ label, values }: ComparisonRowProps) {
  return (
    <Tr>
      <Td fontWeight="700">{label}</Td>
      {values.map((value, index) => (
        <Td key={`${label}-${index}`}>{value}</Td>
      ))}
    </Tr>
  );
}
