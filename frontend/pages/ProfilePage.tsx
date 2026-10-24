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
      <Container py={10}>
        <Alert status="info">
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
    <Container maxW="760px" py={10}>
      <Stack gap={6}>
        <Box>
          <Heading>Profile</Heading>
          <Text color="gray.400" mt={2}>
            Your public name and avatar appear beside your GameMeter reviews.
          </Text>
        </Box>

        <Stack
          direction={{ base: "column", sm: "row" }}
          align={{ base: "start", sm: "center" }}
          gap={4}
        >
          <Avatar
            size="2xl"
            name={profile?.display_name}
            src={profile?.avatar_url ?? undefined}
          />

          <Stack>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              p={1}
              onChange={(event) =>
                void handleAvatarChange(event.target.files?.[0])
              }
            />
            <Text fontSize="xs" color="gray.400">
              JPG, PNG, or WebP · maximum 2 MB.
            </Text>

            {profile?.avatar_url && (
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                alignSelf="start"
                onClick={handleRemoveAvatar}
              >
                Remove picture
              </Button>
            )}
          </Stack>
        </Stack>

        <FormControl>
          <FormLabel>Display name</FormLabel>
          <Input
            value={displayName}
            maxLength={60}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            value={bio}
            maxLength={500}
            placeholder="A short public gaming bio."
            onChange={(event) => setBio(event.target.value)}
          />
        </FormControl>

        <Button colorScheme="green" isLoading={saving} onClick={handleSave}>
          Save profile
        </Button>
      </Stack>
    </Container>
  );
}
