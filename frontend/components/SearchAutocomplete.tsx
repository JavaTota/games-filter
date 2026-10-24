import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { BsSearch } from "react-icons/bs";

import useDebouncedValue from "../hooks/useDebouncedValue";
import { useCachedQuery } from "../lib/queryCache";
import { useRouter } from "../lib/useRouter";
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
        <InputGroup>
          <InputLeftElement>
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
            placeholder="Search games..."
            borderRadius="full"
            bg="whiteAlpha.100"
            aria-label="Search games"
            aria-autocomplete="list"
            aria-expanded={showResults}
          />
        </InputGroup>
      </form>

      {showResults && (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          left="0"
          right="0"
          bg="gray.700"
          borderRadius="lg"
          shadow="2xl"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          zIndex="30"
          overflow="hidden"
        >
          {searchQuery.isLoading && (
            <Box p={3}>
              <Spinner size="sm" />
            </Box>
          )}

          {!searchQuery.isLoading && results.length === 0 && (
            <Text p={3}>No matches found.</Text>
          )}

          <List role="listbox">
            {results.map((game, index) => (
              <ListItem
                key={game.id}
                role="option"
                aria-selected={activeIndex === index}
                px={4}
                py={3}
                cursor="pointer"
                bg={activeIndex === index ? "whiteAlpha.200" : undefined}
                _hover={{ bg: "whiteAlpha.100" }}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openGame(index)}
              >
                {game.name}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
