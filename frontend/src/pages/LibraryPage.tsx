import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAuth } from "../context/useAuth";
import { useCachedQuery } from "../lib/queryCache";
import { AppLink } from "../lib/router";
import { getLibrary } from "../services/communityService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import type { LibraryEntry } from "../types/community";

export default function LibraryPage() {
  const { session } = useAuth();
  const libraryQuery = useCachedQuery(
    `library:${session?.user.id ?? "guest"}`,
    getLibrary,
    {
      enabled: Boolean(session && isSupabaseConfigured),
      ttlMs: 20_000,
    },
  );

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
            YOUR GAMES
          </Text>
          <Heading size="xl" mt={1}>
            My Library
          </Heading>
          <Text color="textSecondary" mt={2} maxW="700px">
            Keep favorites, backlog, currently playing, completed, and dropped
            games in one clean place.
          </Text>
        </Box>

        {!isSupabaseConfigured && (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            Configure Supabase to activate personal libraries.
          </Alert>
        )}

        {isSupabaseConfigured && !session && (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Text>
              <AppLink to="/auth">Sign in</AppLink> to save and sync your
              library.
            </Text>
          </Alert>
        )}

        {libraryQuery.isLoading && (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} height="300px" borderRadius="2xl" />
            ))}
          </SimpleGrid>
        )}

        {libraryQuery.data?.length === 0 && (
          <Box
            bg="surface"
            borderWidth="1px"
            borderColor="borderSubtle"
            borderRadius="2xl"
            p={8}
            textAlign="center"
          >
            <Heading size="md">Your library is empty</Heading>
            <Text color="textSecondary" mt={2}>
              Open any game and choose a status to start building it.
            </Text>
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {libraryQuery.data?.map((entry) => (
            <LibraryCard key={entry.game_id} entry={entry} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function LibraryCard({ entry }: { entry: LibraryEntry }) {
  const statusLabel = entry.status.replace(/_/g, " ");

  return (
    <Box
      bg="surface"
      borderWidth="1px"
      borderColor="borderSubtle"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 14px 40px rgba(5,10,25,.08)"
      transition="transform .2s ease, border-color .2s ease"
      _hover={{ transform: "translateY(-4px)", borderColor: "brand.400" }}
    >
      <Image
        src={entry.background_image ?? "/gamemaster-logo.webp"}
        alt={entry.game_name}
        aspectRatio={16 / 9}
        width="100%"
        objectFit="cover"
      />

      <Stack p={5} gap={3}>
        <HStack justify="space-between">
          <Badge colorScheme="purple" borderRadius="full">
            {statusLabel}
          </Badge>
          {entry.favorite && (
            <Badge colorScheme="yellow" borderRadius="full">
              Favorite
            </Badge>
          )}
        </HStack>

        <Heading size="md">
          <AppLink to={`/games/${entry.game_id}/${entry.game_slug}`}>
            {entry.game_name}
          </AppLink>
        </Heading>
      </Stack>
    </Box>
  );
}
