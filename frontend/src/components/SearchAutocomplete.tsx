import {
  Box,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { BsSearch } from "react-icons/bs";

import useDebouncedValue from "../hooks/useDebouncedValue";
import { useCachedQuery } from "../lib/queryCache";
import { useRouter } from "../lib/useRouter";
import getCroppedImageUrl from "../services/imageUrl";
import { searchGames } from "../services/rawgService";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { navigate } = useRouter();

  const searchTerm = useDebouncedValue(value.trim(), 300);
  const searchQuery = useCachedQuery(
    `autocomplete:${searchTerm}`,
    () => searchGames(searchTerm),
    {
      enabled: searchTerm.length >= 2,
      ttlMs: 60_000,
    },
  );

  const results = searchQuery.data?.results ?? [];
  const showResults = isOpen && searchTerm.length >= 2;

  const openGame = (index: number) => {
    const game = results[index];
    if (!game) return;

    setIsOpen(false);
    navigate(`/games/${game.id}/${game.slug}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (activeIndex >= 0) {
      openGame(activeIndex);
      return;
    }

    setIsOpen(false);
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Box position="relative" width="100%">
      <form onSubmit={handleSubmit}>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none" color="textMuted">
            <BsSearch />
          </InputLeftElement>

          <Input
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder="Search games, genres, worlds..."
            borderRadius="2xl"
            bg="inputBg"
            color="textPrimary"
            borderColor="borderSubtle"
            boxShadow="0 16px 45px rgba(0,0,0,.14)"
            aria-label="Search games"
            aria-autocomplete="list"
            aria-expanded={showResults}
          />
        </InputGroup>
      </form>

      {showResults && (
        <Box
          position="absolute"
          top="calc(100% + 10px)"
          left="0"
          right="0"
          bg="surfaceElevated"
          color="textPrimary"
          borderRadius="2xl"
          shadow="2xl"
          borderWidth="1px"
          borderColor="borderSubtle"
          zIndex="30"
          overflow="hidden"
        >
          {searchQuery.isLoading && (
            <HStack p={4} color="textSecondary">
              <Spinner size="sm" />
              <Text>Searching games…</Text>
            </HStack>
          )}

          {!searchQuery.isLoading && results.length === 0 && (
            <Text p={4} color="textSecondary">
              No matches found.
            </Text>
          )}

          <List role="listbox">
            {results.map((game, index) => (
              <ListItem
                key={game.id}
                role="option"
                aria-selected={activeIndex === index}
                px={3}
                py={2.5}
                cursor="pointer"
                bg={activeIndex === index ? "surfaceMuted" : "transparent"}
                _hover={{ bg: "surfaceMuted" }}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openGame(index)}
              >
                <HStack gap={3}>
                  <Image
                    src={getCroppedImageUrl(game.background_image ?? "")}
                    fallbackSrc="/gamemaster-logo.webp"
                    alt=""
                    boxSize="52px"
                    borderRadius="lg"
                    objectFit="cover"
                  />
                  <Stack gap={0} minW={0}>
                    <Text fontWeight="800" noOfLines={1}>
                      {game.name}
                    </Text>
                    <Text fontSize="sm" color="textSecondary">
                      {game.released?.slice(0, 4) ?? "Release TBA"}
                      {game.rating ? ` · ${game.rating.toFixed(1)}/5` : ""}
                    </Text>
                  </Stack>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
