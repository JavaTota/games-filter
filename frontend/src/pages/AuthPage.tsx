import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { FiBookmark, FiMessageSquare, FiStar } from "react-icons/fi";

import { useAuth } from "../context/useAuth";
import { useRouter } from "../lib/useRouter";
import { isSupabaseConfigured } from "../services/supabaseClient";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const { session, signIn, signUp } = useAuth();
  const { navigate } = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) {
    return (
      <Container maxW="720px" py={{ base: 14, md: 24 }}>
        <Box
          bg="surface"
          borderWidth="1px"
          borderColor="borderSubtle"
          borderRadius="3xl"
          p={{ base: 7, md: 10 }}
          textAlign="center"
        >
          <Heading>You are signed in</Heading>
          <Text mt={3} color="textSecondary">
            {session.user.email}
          </Text>
          <Button mt={6} colorScheme="brand" onClick={() => navigate("/library")}>
            Open my library
          </Button>
        </Box>
      </Container>
    );
  }

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate("/");
        return;
      }

      const signedIn = await signUp(email.trim(), password, displayName.trim());

      if (signedIn) {
        navigate("/");
      } else {
        setMessage("Account created. Check your email to confirm it, then sign in.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode((current) => (current === "signin" ? "signup" : "signin"));
    setError("");
    setMessage("");
  };

  const formIsValid =
    Boolean(email) &&
    password.length >= 6 &&
    (mode === "signin" || Boolean(displayName.trim()));

  return (
    <Container maxW="1100px" py={{ base: 8, md: 14 }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0}>
        <Stack
          justify="center"
          gap={6}
          p={{ base: 7, md: 10 }}
          color="white"
          bgGradient="linear(145deg, #172554, #312E81 70%, #111827)"
          borderTopRadius={{ base: "3xl", md: "3xl" }}
          borderBottomLeftRadius={{ base: "none", md: "3xl" }}
          borderTopRightRadius={{ base: "3xl", md: "none" }}
        >
          <Box>
            <Text color="brand.200" fontWeight="800" letterSpacing="0.12em">
              GAMEMETER ACCOUNT
            </Text>
            <Heading size="xl" mt={2} letterSpacing="-0.03em">
              Keep your game life in sync.
            </Heading>
            <Text mt={3} color="whiteAlpha.800" lineHeight="1.7">
              Sign in once and your reviews, favorites, profile, and library
              follow you across devices.
            </Text>
          </Box>

          <Stack gap={3}>
            <Feature icon={<FiBookmark />} text="Build a personal game library" />
            <Feature icon={<FiMessageSquare />} text="Write and edit GameMeter reviews" />
            <Feature icon={<FiStar />} text="Save favorites and playing status" />
          </Stack>
        </Stack>

        <Box
          bg="surface"
          color="textPrimary"
          borderWidth="1px"
          borderColor="borderSubtle"
          borderLeftWidth={{ base: "1px", md: "0" }}
          borderTopWidth={{ base: "0", md: "1px" }}
          borderRightRadius={{ base: "none", md: "3xl" }}
          borderBottomRadius={{ base: "3xl", md: "3xl" }}
          borderBottomLeftRadius={{ base: "3xl", md: "none" }}
          p={{ base: 7, md: 10 }}
        >
          <Stack gap={5}>
            <Box>
              <Heading>{mode === "signin" ? "Welcome back" : "Create account"}</Heading>
              <Text color="textSecondary" mt={2}>
                {mode === "signin"
                  ? "Sign in to continue your library and reviews."
                  : "Create your profile and start building your library."}
              </Text>
            </Box>

            {!isSupabaseConfigured && (
              <Alert status="warning" borderRadius="xl">
                <AlertIcon />
                Supabase environment variables are not configured.
              </Alert>
            )}

            {error && (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {message && (
              <Alert status="success" borderRadius="xl">
                <AlertIcon />
                {message}
              </Alert>
            )}

            {mode === "signup" && (
              <FormControl>
                <FormLabel color="textSecondary">Display name</FormLabel>
                <Input
                  value={displayName}
                  maxLength={60}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel color="textSecondary">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="textSecondary">Password</FormLabel>
              <Input
                type="password"
                value={password}
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormControl>

            <Button
              colorScheme="brand"
              isLoading={busy}
              isDisabled={!isSupabaseConfigured || !formIsValid}
              onClick={handleSubmit}
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <Button variant="ghost" onClick={switchMode}>
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </Stack>
        </Box>
      </SimpleGrid>
    </Container>
  );
}

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Stack direction="row" align="center" gap={3}>
      <Box
        display="grid"
        placeItems="center"
        boxSize="38px"
        flexShrink={0}
        borderRadius="xl"
        bg="whiteAlpha.200"
      >
        {icon}
      </Box>
      <Text fontWeight="700">{text}</Text>
    </Stack>
  );
}
