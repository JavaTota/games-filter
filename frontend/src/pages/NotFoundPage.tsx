import { Box, Button, Container, Heading, Text } from "@chakra-ui/react";

import { AppLink } from "../lib/router";

export default function NotFoundPage() {
  return (
    <Container maxW="760px" py={{ base: 14, md: 24 }} textAlign="center">
      <Box
        bg="surface"
        borderWidth="1px"
        borderColor="borderSubtle"
        borderRadius="3xl"
        p={{ base: 8, md: 12 }}
      >
        <Text color="brand.400" fontWeight="900" fontSize="sm" letterSpacing="0.12em">
          404
        </Text>
        <Heading mt={2}>Page not found</Heading>
        <Text mt={3} color="textSecondary">
          The page you requested does not exist or may have moved.
        </Text>
        <Button as="span" mt={6} colorScheme="brand">
          <AppLink to="/">Back to Discover</AppLink>
        </Button>
      </Box>
    </Container>
  );
}
