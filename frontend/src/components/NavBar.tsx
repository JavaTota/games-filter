import { Avatar, Button, HStack, Image, Spacer, Text } from "@chakra-ui/react";
import logo from "../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import { AppLink } from "../lib/router";
import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { games } = useCompare();
  const { session, profile, signOut } = useAuth();

  return (
    <HStack as="nav" padding={{ base: 3, md: 4 }} gap={{ base: 2, md: 4 }} position="sticky" top="0" zIndex="20" bg="gray.800" borderBottomWidth="1px" borderColor="whiteAlpha.200">
      <AppLink to="/" ariaLabel="GameFilter home"><HStack><Image src={logo} boxSize={{ base: "42px", md: "52px" }} alt="GameFilter logo" /><Text fontWeight="800" display={{ base: "none", sm: "block" }}>GameFilter</Text></HStack></AppLink>
      <HStack gap={1}>
        <Button as="span" size="sm" variant="ghost"><AppLink to="/">Discover</AppLink></Button>
        <Button as="span" size="sm" variant="ghost"><AppLink to="/compare">Compare ({games.length})</AppLink></Button>
        <Button as="span" size="sm" variant="ghost"><AppLink to="/library">My Library</AppLink></Button>
      </HStack>
      <Spacer />
      {session ? (
        <HStack>
          <AppLink to="/profile" ariaLabel="Open profile"><Avatar size="sm" name={profile?.display_name} src={profile?.avatar_url ?? undefined} /></AppLink>
          <Button size="sm" variant="outline" onClick={() => void signOut()}>Sign out</Button>
        </HStack>
      ) : <Button as="span" size="sm" colorScheme="green"><AppLink to="/auth">Sign in</AppLink></Button>}
      <ColorModeSwitch />
    </HStack>
  );
};

export default NavBar;
