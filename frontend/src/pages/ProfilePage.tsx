import {
  Alert,
  AlertIcon,
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Grid,
  GridItem,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useAuth } from "../context/useAuth";
import { AppLink } from "../lib/router";
import {
  deleteAvatar,
  updateProfile,
  uploadAvatar,
} from "../services/profileService";

export default function ProfilePage() {
  const { session, profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile]);

  if (!session) {
    return (
      <Container maxW="760px" py={12}>
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          <Text>
            <AppLink to="/auth">Sign in</AppLink> to manage your profile.
          </Text>
        </Alert>
      </Container>
    );
  }

  const showError = (error: unknown, fallback: string) => {
    toast({
      title: error instanceof Error ? error.message : fallback,
      status: "error",
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await updateProfile(displayName.trim(), bio.trim());
      await refreshProfile();
      toast({ title: "Profile updated.", status: "success" });
    } catch (error) {
      showError(error, "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;

    try {
      await uploadAvatar(file);
      await refreshProfile();
      toast({ title: "Profile picture updated.", status: "success" });
    } catch (error) {
      showError(error, "Avatar upload failed.");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatar();
      await refreshProfile();
      toast({ title: "Profile picture removed.", status: "success" });
    } catch (error) {
      showError(error, "Could not remove profile picture.");
    }
  };

  return (
    <Container maxW="980px" py={{ base: 8, md: 12 }}>
      <Stack gap={7}>
        <Box>
          <Text
            color="brand.400"
            fontWeight="800"
            fontSize="sm"
            letterSpacing="0.12em"
          >
            PUBLIC PROFILE
          </Text>
          <Heading size="xl" mt={1}>
            Profile
          </Heading>
          <Text color="textSecondary" mt={2}>
            Your public name, avatar, and bio appear beside your GameMeter
            reviews.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "280px 1fr" }} gap={6}>
          <GridItem>
          <Stack
            bg="surface"
            borderWidth="1px"
            borderColor="borderSubtle"
            borderRadius="2xl"
            p={6}
            align="center"
            textAlign="center"
            gap={4}
            height="fit-content"
          >
            <Avatar
              size="2xl"
              name={profile?.display_name}
              src={profile?.avatar_url ?? undefined}
              borderWidth="3px"
              borderColor="brand.400"
            />
            <Box>
              <Text fontWeight="900" fontSize="lg">
                {profile?.display_name || session.user.email}
              </Text>
              <Text fontSize="sm" color="textSecondary">
                GameFilter member
              </Text>
            </Box>

            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              p={1}
              fontSize="sm"
              onChange={(event) =>
                void handleAvatarChange(event.target.files?.[0])
              }
            />
            <Text fontSize="xs" color="textMuted">
              JPG, PNG, or WebP · maximum 2 MB.
            </Text>

            {profile?.avatar_url && (
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={handleRemoveAvatar}
              >
                Remove picture
              </Button>
            )}
          </Stack>
          </GridItem>

          <GridItem>
          <Stack
            bg="surface"
            borderWidth="1px"
            borderColor="borderSubtle"
            borderRadius="2xl"
            p={{ base: 5, md: 7 }}
            gap={5}
          >
            <FormControl>
              <FormLabel color="textSecondary">Display name</FormLabel>
              <Input
                value={displayName}
                maxLength={60}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="textSecondary">Bio</FormLabel>
              <Textarea
                value={bio}
                maxLength={500}
                minH="150px"
                placeholder="What do you play, what do you love, and what kind of recommendations are you looking for?"
                onChange={(event) => setBio(event.target.value)}
              />
              <Text mt={2} fontSize="xs" color="textMuted" textAlign="right">
                {bio.length}/500
              </Text>
            </FormControl>

            <Button
              colorScheme="brand"
              alignSelf="flex-start"
              isLoading={saving}
              onClick={handleSave}
            >
              Save profile
            </Button>
          </Stack>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
