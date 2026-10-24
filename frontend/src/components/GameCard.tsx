import { Badge, Button, Card, CardBody, Heading, HStack, Image, Stack, Text, useToast } from "@chakra-ui/react";
import type { DiscoverFilters, Game } from "../types/game";
import getCroppedImageUrl from "../services/imageUrl";
import { AppLink } from "../lib/router";
import { useCompare } from "../context/CompareContext";
import { calculateMatchScore } from "../utils/recommendation";

interface Props { game: Game; filters: DiscoverFilters; }

const GameCard = ({ game, filters }: Props) => {
  const { games, toggle } = useCompare();
  const toast = useToast();
  const selected = games.some((item) => item.id === game.id);
  const match = calculateMatchScore(game, filters);

  return (
    <Card overflow="hidden" height="100%" transition="transform .18s ease, box-shadow .18s ease" _hover={{ transform: "translateY(-4px)", shadow: "xl" }}>
      <Image src={getCroppedImageUrl(game.background_image ?? "")} alt={`${game.name} cover`} aspectRatio={16 / 9} objectFit="cover" fallbackSrc="/gamefilter-logo.webp" />
      <CardBody>
        <Stack gap={3}>
          <HStack justify="space-between">
            <Badge colorScheme="purple">{match}% match</Badge>
            <Badge colorScheme={game.metacritic && game.metacritic >= 75 ? "green" : "gray"}>{game.metacritic ?? "N/A"} critic</Badge>
          </HStack>
          <Heading fontSize="xl" lineHeight="1.2"><AppLink to={`/games/${game.id}/${game.slug}`}>{game.name}</AppLink></Heading>
          <Text fontSize="sm" color="gray.400">Player rating {game.rating?.toFixed(1) ?? "N/A"}/5 · {game.released ?? "Release TBA"}</Text>
          <HStack>
            <Button as="span" size="sm" colorScheme="green" flex="1"><AppLink to={`/games/${game.id}/${game.slug}`}>View game</AppLink></Button>
            <Button size="sm" variant={selected ? "solid" : "outline"} onClick={() => {
              const message = toggle(game);
              if (message) toast({ title: message, status: "warning", duration: 2500 });
            }}>{selected ? "Selected" : "Compare"}</Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default GameCard;
