import { Box, Button, Container, Heading, Image, SimpleGrid, Stack, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useCompare } from "../context/CompareContext";
import { AppLink } from "../lib/router";

export default function ComparePage() {
  const { games, clear } = useCompare();
  if (games.length === 0) return <Container py={16} textAlign="center"><Heading>No games selected</Heading><Text mt={3} color="gray.400">Choose up to three games from Discover or a game detail page.</Text><Button as="span" mt={5} colorScheme="green"><AppLink to="/">Discover games</AppLink></Button></Container>;

  return (
    <Container maxW="1200px" py={8}>
      <Stack gap={6}>
        <Box><Heading>Compare games</Heading><Text color="gray.400" mt={2}>A side-by-side view makes tradeoffs easier to see.</Text></Box>
        <SimpleGrid columns={{ base: 1, md: games.length }} spacing={4}>{games.map((game) => <Box key={game.id} borderWidth="1px" borderRadius="xl" overflow="hidden"><Image src={game.background_image ?? "/gamefilter-logo.webp"} alt={game.name} aspectRatio={16 / 9} objectFit="cover" /><Box p={4}><Heading size="md"><AppLink to={`/games/${game.id}/${game.slug}`}>{game.name}</AppLink></Heading></Box></Box>)}</SimpleGrid>
        <Box overflowX="auto"><Table variant="simple"><Thead><Tr><Th>Metric</Th>{games.map((game) => <Th key={game.id}>{game.name}</Th>)}</Tr></Thead><Tbody><Row label="Player rating" values={games.map((g) => `${g.rating.toFixed(1)}/5`)} /><Row label="Critic score" values={games.map((g) => g.metacritic ?? "N/A")} /><Row label="Released" values={games.map((g) => g.released ?? "TBA")} /><Row label="Playtime" values={games.map((g) => g.playtime ? `${g.playtime}h` : "N/A")} /><Row label="Genres" values={games.map((g) => g.genres?.map((x) => x.name).join(", ") || "N/A")} /></Tbody></Table></Box>
        <Button alignSelf="flex-start" variant="outline" onClick={clear}>Clear comparison</Button>
      </Stack>
    </Container>
  );
}

function Row({ label, values }: { label: string; values: (string | number)[] }) { return <Tr><Td fontWeight="700">{label}</Td>{values.map((value, i) => <Td key={`${label}-${i}`}>{value}</Td>)}</Tr>; }
