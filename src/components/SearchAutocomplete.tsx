import { Box, Input, InputGroup, InputLeftElement, List, ListItem, Spinner, Text } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";
import { useState } from "react";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { useCachedQuery } from "../lib/queryCache";
import { searchGames } from "../services/rawgService";
import { useRouter } from "../lib/router";

interface Props { value: string; onChange: (value: string) => void; onSubmit: () => void; }

/** Debounced autocomplete supports mouse and keyboard selection without over-querying RAWG. */
export default function SearchAutocomplete({ value, onChange, onSubmit }: Props) {
  const debounced = useDebouncedValue(value.trim(), 300);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { navigate } = useRouter();
  const query = useCachedQuery(`autocomplete:${debounced}`, () => searchGames(debounced), { enabled: debounced.length >= 2, ttlMs: 60_000 });
  const results = query.data?.results ?? [];

  const openGame = (index: number) => {
    const game = results[index];
    if (!game) return;
    setFocused(false);
    navigate(`/games/${game.id}/${game.slug}`);
  };

  return (
    <Box position="relative" width="100%">
      <form onSubmit={(event) => { event.preventDefault(); if (activeIndex >= 0) openGame(activeIndex); else { setFocused(false); onSubmit(); } }}>
        <InputGroup>
          <InputLeftElement><BsSearch /></InputLeftElement>
          <Input
            value={value}
            onChange={(e) => { onChange(e.target.value); setActiveIndex(-1); }}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (!focused || results.length === 0) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((current) => Math.min(current + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)); }
              if (e.key === "Escape") setFocused(false);
            }}
            placeholder="Search games..."
            borderRadius="full"
            bg="whiteAlpha.100"
            aria-label="Search games"
            aria-autocomplete="list"
            aria-expanded={focused && debounced.length >= 2}
          />
        </InputGroup>
      </form>
      {focused && debounced.length >= 2 && (
        <Box position="absolute" top="calc(100% + 8px)" left="0" right="0" bg="gray.700" borderRadius="lg" shadow="2xl" borderWidth="1px" borderColor="whiteAlpha.200" zIndex="30" overflow="hidden">
          {query.isLoading && <Box p={3}><Spinner size="sm" /></Box>}
          {!query.isLoading && results.length === 0 && <Text p={3}>No matches found.</Text>}
          <List role="listbox">
            {results.map((game, index) => (
              <ListItem
                role="option"
                aria-selected={activeIndex === index}
                key={game.id}
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
