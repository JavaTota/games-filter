import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../lib/router";
import { isSupabaseConfigured } from "../services/supabaseClient";

export default function AuthPage() {
  const { session, signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) return <Container py={16}><Heading>You are signed in</Heading><Text mt={3}>{session.user.email}</Text><Button mt={5} colorScheme="green" onClick={() => navigate("/library")}>Open my library</Button></Container>;

  const submit = async () => {
    setError(""); setMessage(""); setBusy(true);
    try {
      if (mode === "signin") { await signIn(email.trim(), password); navigate("/"); }
      else {
        const active = await signUp(email.trim(), password, displayName.trim());
        if (active) navigate("/"); else setMessage("Account created. Check your email to confirm it, then sign in.");
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Authentication failed."); }
    finally { setBusy(false); }
  };

  return (
    <Container maxW="500px" py={12}>
      <Box borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 8 }}>
        <Stack gap={5}>
          <Box><Heading>{mode === "signin" ? "Sign in" : "Create account"}</Heading><Text color="gray.400" mt={2}>An account unlocks reviews, favorites, and your personal game library.</Text></Box>
          {!isSupabaseConfigured && <Alert status="warning"><AlertIcon />Supabase environment variables are not configured.</Alert>}
          {error && <Alert status="error"><AlertIcon />{error}</Alert>}{message && <Alert status="success"><AlertIcon />{message}</Alert>}
          {mode === "signup" && <FormControl><FormLabel>Display name</FormLabel><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} /></FormControl>}
          <FormControl><FormLabel>Email</FormLabel><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormControl>
          <FormControl><FormLabel>Password</FormLabel><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} /></FormControl>
          <Button colorScheme="green" isLoading={busy} isDisabled={!isSupabaseConfigured || !email || password.length < 6 || (mode === "signup" && !displayName.trim())} onClick={() => void submit()}>{mode === "signin" ? "Sign in" : "Create account"}</Button>
          <Button variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
