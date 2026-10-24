import { Button, Container, Heading, Text } from "@chakra-ui/react";

import { AppLink } from "../lib/router";

export default function NotFoundPage() {
  return (
    <Container py={20} textAlign="center">
      <Heading>Page not found</Heading>
      <Text mt={3} color="gray.400">
        The page you requested does not exist.
      </Text>
      <Button as="span" mt={5} colorScheme="green">
        <AppLink to="/">Back to Discover</AppLink>
      </Button>
    </Container>
  );
}
