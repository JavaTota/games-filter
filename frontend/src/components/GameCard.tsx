import {
  Badge,
  Box,
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

import { useCompare } from "../context/useCompare";
import { AppLink } from "../lib/router";
import getCroppedImageUrl from "../services/imageUrl";
import type { DiscoverFilters, Game } from "../types/game";
import { calculateMatchScore } from "../utils/recommendation";

interface Props {
  game: Game;
  filters: DiscoverFilters;
}

export default function GameCard({ game, filters }: Props) {
  const { games: comparedGames, toggle } = useCompare();
  const toast = useToast();

  const isSelected = comparedGames.some((item) => item.id === game.id);
  const matchScore = calculateMatchScore(game, filters);
  const genres = game.genres?.slice(0, 2).map((genre) => genre.name).join(" · ");

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
      bg="surface"
      color="textPrimary"
      boxShadow="0 14px 40px rgba(5,10,25,.10)"
      transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "0 22px 55px rgba(5,10,25,.20)",
        borderColor: "brand.400",
      }}
    >
      <Box position="relative">
        <Image
          src={getCroppedImageUrl(game.background_image ?? "")}
          alt={`${game.name} cover`}
          fallbackSrc="/gamemeter-logo.webp"
          aspectRatio={16 / 9}
          width="100%"
          objectFit="cover"
        />
        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-t, rgba(7,10,17,.72), transparent 55%)"
        />
        <HStack position="absolute" left={3} right={3} bottom={3} justify="space-between">
          <Badge
            px={2.5}
            py={1}
            borderRadius="full"
            bg="rgba(49,82,229,.88)"
            color="white"
          >
            {matchScore}% match
          </Badge>
          <Badge
            px={2.5}
            py={1}
            borderRadius="full"
            bg="rgba(7,10,17,.82)"
            color="white"
          >
            {game.metacritic ?? "N/A"} critic
          </Badge>
        </HStack>
      </Box>

      <CardBody display="flex" flexDirection="column">
        <Stack height="100%" gap={3}>
          <Box>
            <Heading fontSize="xl" lineHeight="1.25" minHeight="3.15rem">
              <AppLink to={`/games/${game.id}/${game.slug}`}>
                {game.name}
              </AppLink>
            </Heading>
            {genres && (
              <Text fontSize="sm" color="textMuted" mt={1} noOfLines={1}>
                {genres}
              </Text>
            )}
          </Box>

          <Text fontSize="sm" color="textSecondary">
            Player rating {game.rating?.toFixed(1) ?? "N/A"}/5 · {" "}
            {game.released?.slice(0, 4) ?? "TBA"}
          </Text>

          <HStack marginTop="auto" pt={1}>
            <Button as="span" size="sm" colorScheme="brand" flex="1">
              <AppLink to={`/games/${game.id}/${game.slug}`}>
                View game
              </AppLink>
            </Button>

            <Button
              size="sm"
              variant={isSelected ? "solid" : "outline"}
              colorScheme={isSelected ? "purple" : "gray"}
              onClick={handleCompare}
            >
              {isSelected ? "Selected" : "Compare"}
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}
