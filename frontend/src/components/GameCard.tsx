import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useCompare } from "../context/CompareContext";
import { AppLink } from "../lib/router";
import getCroppedImageUrl from "../services/imageUrl";
import type { DiscoverFilters, Game } from "../types/game";
import { calculateMatchScore } from "../utils/recommendation";

interface Props {
  game: Game;
  filters: DiscoverFilters;
}

const GameCard = ({ game, filters }: Props) => {
  const { games: comparedGames, toggle } = useCompare();
  const toast = useToast();

  const isSelected = comparedGames.some(
    (comparedGame) => comparedGame.id === game.id,
  );
  const matchScore = calculateMatchScore(game, filters);
  const criticColor =
    game.metacritic && game.metacritic >= 75 ? "green" : "gray";

  const handleCompare = () => {
    const message = toggle(game);

    if (message) {
      toast({
        title: message,
        status: "warning",
        duration: 2500,
      });
    }
  };

  return (
    <Card
      height="100%"
      overflow="hidden"
      transition="transform 0.18s ease, box-shadow 0.18s ease"
      _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
    >
      <Image
        src={getCroppedImageUrl(game.background_image ?? "")}
        alt={`${game.name} cover`}
        fallbackSrc="/gamefilter-logo.webp"
        aspectRatio={16 / 9}
        objectFit="cover"
      />

      <CardBody>
        <Stack height="100%" gap={3}>
          <HStack justify="space-between">
            <Badge colorScheme="purple">{matchScore}% match</Badge>
            <Badge colorScheme={criticColor}>
              {game.metacritic ?? "N/A"} critic
            </Badge>
          </HStack>

          <Heading fontSize="xl" lineHeight="1.2" minHeight="3rem">
            <AppLink to={`/games/${game.id}/${game.slug}`}>
              {game.name}
            </AppLink>
          </Heading>

          <Text fontSize="sm" color="gray.400">
            Player rating {game.rating?.toFixed(1) ?? "N/A"}/5 ·{" "}
            {game.released ?? "Release TBA"}
          </Text>

          <HStack marginTop="auto">
            <Button as="span" size="sm" colorScheme="green" flex="1">
              <AppLink to={`/games/${game.id}/${game.slug}`}>
                View game
              </AppLink>
            </Button>

            <Button
              size="sm"
              variant={isSelected ? "solid" : "outline"}
              onClick={handleCompare}
            >
              {isSelected ? "Selected" : "Compare"}
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default GameCard;
