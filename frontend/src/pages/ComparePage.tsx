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
      <Container maxW="900px" py={{ base: 14, md: 24 }} textAlign="center">
        <Box
          bg="surface"
          borderWidth="1px"
          borderColor="borderSubtle"
          borderRadius="3xl"
          px={{ base: 6, md: 12 }}
          py={{ base: 10, md: 14 }}
          boxShadow="0 18px 50px rgba(5,10,25,.10)"
        >
          <Text color="brand.400" fontWeight="800" mb={2}>
            GAME COMPARISON
          </Text>
          <Heading>No games selected yet</Heading>
          <Text mt={3} color="textSecondary" maxW="560px" mx="auto">
            Choose up to three games from Discover or a game detail page. We’ll
            line up the ratings, release dates, playtime, and genres for you.
          </Text>
          <Button as="span" mt={6} colorScheme="brand">
            <AppLink to="/">Discover games</AppLink>
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="1200px" py={{ base: 8, md: 12 }}>
      <Stack gap={7}>
        <Box>
          <Text
            color="brand.400"
            fontWeight="800"
            fontSize="sm"
            letterSpacing="0.12em"
          >
            SIDE BY SIDE
          </Text>
          <Heading size="xl" mt={1}>
            Compare games
          </Heading>
          <Text color="textSecondary" mt={2}>
            Put the tradeoffs next to each other before you commit your time.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: games.length }} spacing={5}>
          {games.map((game) => (
            <Box
              key={game.id}
              bg="surface"
              borderWidth="1px"
              borderColor="borderSubtle"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 14px 40px rgba(5,10,25,.08)"
            >
              <Image
                src={game.background_image ?? "/gamemeter-logo.webp"}
                alt={game.name}
                aspectRatio={16 / 9}
                width="100%"
                objectFit="cover"
              />
              <Box p={5}>
                <Heading size="md">
                  <AppLink to={`/games/${game.id}/${game.slug}`}>
                    {game.name}
                  </AppLink>
                </Heading>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        <Box
          overflowX="auto"
          bg="surface"
          borderWidth="1px"
          borderColor="borderSubtle"
          borderRadius="2xl"
          p={{ base: 2, md: 4 }}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="textSecondary" borderColor="borderSubtle">
                  Metric
                </Th>
                {games.map((game) => (
                  <Th
                    key={game.id}
                    color="textPrimary"
                    borderColor="borderSubtle"
                  >
                    {game.name}
                  </Th>
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
      <Td fontWeight="800" color="textSecondary" borderColor="borderSubtle">
        {label}
      </Td>
      {values.map((value, index) => (
        <Td key={`${label}-${index}`} borderColor="borderSubtle">
          {value}
        </Td>
      ))}
    </Tr>
  );
}
