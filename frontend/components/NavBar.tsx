import {
  Avatar,
  Button,
  HStack,
  Image,
  Spacer,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

import logo from "../assets/logo.webp";
import { useAuth } from "../context/useAuth";
import { useCompare } from "../context/useCompare";
import { AppLink } from "../lib/router";
import ColorModeSwitch from "./ColorModeSwitch";

const NavBar = () => {
  const { games: comparedGames } = useCompare();
  const { session, profile, signOut } = useAuth();

  return (
    <HStack
      as="nav"
      padding={{ base: 3, md: 4 }}
      gap={{ base: 2, md: 4 }}
      position="sticky"
      top="0"
      zIndex="20"
      bg="gray.800"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <AppLink to="/" ariaLabel="GameFilter home">
        <HStack>
          <Image
            src={logo}
            boxSize={{ base: "42px", md: "52px" }}
            alt="GameFilter logo"
          />
          <Text fontWeight="800" display={{ base: "none", sm: "block" }}>
            GameFilter
          </Text>
        </HStack>
      </AppLink>

      <HStack gap={1}>
        <NavLink to="/">Discover</NavLink>
        <NavLink to="/compare">Compare ({comparedGames.length})</NavLink>
        <NavLink to="/library">My Library</NavLink>
      </HStack>

      <Spacer />

      {session ? (
        <HStack>
          <AppLink to="/profile" ariaLabel="Open profile">
            <Avatar
              size="sm"
              name={profile?.display_name}
              src={profile?.avatar_url ?? undefined}
            />
          </AppLink>
          <Button size="sm" variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </HStack>
      ) : (
        <Button as="span" size="sm" colorScheme="green">
          <AppLink to="/auth">Sign in</AppLink>
        </Button>
      )}

      <ColorModeSwitch />
    </HStack>
  );
};

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Button as="span" size="sm" variant="ghost">
      <AppLink to={to}>{children}</AppLink>
    </Button>
  );
}

export default NavBar;
