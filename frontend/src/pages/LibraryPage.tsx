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
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAuth } from "../context/AuthContext";
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
    <Container maxW="1200px" py={8}>
      <Stack gap={6}>
        <Box>
          <Heading>My Library</Heading>
          <Text color="gray.400" mt={2}>
            Favorites, backlog, currently playing, completed, and dropped games
            in one place.
          </Text>
        </Box>

        {!isSupabaseConfigured && (
          <Alert status="info">
            <AlertIcon />
            Configure Supabase to activate personal libraries.
          </Alert>
        )}

        {isSupabaseConfigured && !session && (
          <Alert status="info">
            <AlertIcon />
            <Text>
              <AppLink to="/auth">Sign in</AppLink> to save and sync your library.
            </Text>
          </Alert>
        )}

        {libraryQuery.isLoading && <Text>Loading your library…</Text>}

        {libraryQuery.data?.length === 0 && (
          <Text>Your library is empty. Open any game and choose a status.</Text>
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
    <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
      <Image
        src={entry.background_image ?? "/gamefilter-logo.webp"}
        alt={entry.game_name}
        aspectRatio={16 / 9}
        objectFit="cover"
      />

      <Stack p={4}>
        <HStack justify="space-between">
          <Badge colorScheme="purple">{statusLabel}</Badge>
          {entry.favorite && <Badge colorScheme="yellow">Favorite</Badge>}
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
