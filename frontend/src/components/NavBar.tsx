import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  Image,
  Spacer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

import logo from "../assets/logo.webp";
import { useAuth } from "../context/useAuth";
import { useCompare } from "../context/useCompare";
import { AppLink } from "../lib/router";
import { useRouter } from "../lib/useRouter";
import ColorModeSwitch from "./ColorModeSwitch";

export default function NavBar() {
  const { pathname } = useRouter();
  const { games: comparedGames } = useCompare();
  const { session, profile, signOut } = useAuth();

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="50"
      bg="navBg"
      color="textPrimary"
      borderBottomWidth="1px"
      borderColor="borderSubtle"
      backdropFilter="blur(18px)"
    >
      <HStack
        as="nav"
        maxW="1500px"
        mx="auto"
        px={{ base: 3, md: 6 }}
        py={3}
        gap={{ base: 2, md: 4 }}
      >
        <AppLink to="/" ariaLabel="GameFilter home">
          <HStack gap={2} minW="fit-content">
            <Image
              src={logo}
              boxSize={{ base: "38px", md: "44px" }}
              alt="GameFilter logo"
            />
            <Text
              fontWeight="900"
              fontSize="lg"
              letterSpacing="-0.03em"
              display={{ base: "none", sm: "block" }}
            >
              Game<span style={{ color: "#648EFF" }}>Filter</span>
            </Text>
          </HStack>
        </AppLink>

        <HStack gap={1} display={{ base: "none", md: "flex" }}>
          <NavLink to="/" active={pathname === "/"}>
            Discover
          </NavLink>
          <NavLink to="/compare" active={pathname === "/compare"}>
            <HStack gap={1.5}>
              <Text>Compare</Text>
              {comparedGames.length > 0 && (
                <Badge borderRadius="full" colorScheme="blue">
                  {comparedGames.length}
                </Badge>
              )}
            </HStack>
          </NavLink>
          <NavLink to="/library" active={pathname === "/library"}>
            Library
          </NavLink>
        </HStack>

        <Spacer />

        <HStack gap={1}>
          <ColorModeSwitch />

          {session ? (
            <>
              <Tooltip label="Profile" hasArrow>
                <Box>
                  <AppLink to="/profile" ariaLabel="Open profile">
                    <Avatar
                      size="sm"
                      name={profile?.display_name}
                      src={profile?.avatar_url ?? undefined}
                      borderWidth="2px"
                      borderColor={pathname === "/profile" ? "brand.400" : "borderSubtle"}
                    />
                  </AppLink>
                </Box>
              </Tooltip>
              <Button
                size="sm"
                variant="ghost"
                display={{ base: "none", lg: "inline-flex" }}
                onClick={() => void signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button as="span" size="sm" colorScheme="brand">
              <AppLink to="/auth">Sign in</AppLink>
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack
        px={3}
        pb={2}
        gap={1}
        display={{ base: "flex", md: "none" }}
        overflowX="auto"
      >
        <NavLink to="/" active={pathname === "/"}>
          Discover
        </NavLink>
        <NavLink to="/compare" active={pathname === "/compare"}>
          Compare {comparedGames.length ? `(${comparedGames.length})` : ""}
        </NavLink>
        <NavLink to="/library" active={pathname === "/library"}>
          Library
        </NavLink>
      </HStack>
    </Box>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      as="span"
      size="sm"
      variant="ghost"
      color={active ? "brand.400" : "textSecondary"}
      bg={active ? "surfaceMuted" : "transparent"}
      _hover={{ color: "textPrimary", bg: "surfaceMuted" }}
    >
      <AppLink to={to}>{children}</AppLink>
    </Button>
  );
}
