import { Button, HStack, Select, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useAuth } from "../context/useAuth";
import { useRouter } from "../lib/useRouter";
import {
  deleteLibraryEntry,
  getLibraryEntry,
  saveLibraryEntry,
} from "../services/communityService";
import { isSupabaseConfigured } from "../services/supabaseClient";
import type {
  LibraryEntry,
  LibraryEntryInput,
  LibraryStatus,
} from "../types/community";
import type { GameDetail } from "../types/game";

interface Props {
  game: GameDetail;
}

export default function LibraryControls({ game }: Props) {
  const { session } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [status, setStatus] = useState<LibraryStatus>("want_to_play");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session || !isSupabaseConfigured) return;

    let cancelled = false;

    getLibraryEntry(game.id)
      .then((savedEntry) => {
        if (cancelled) return;
        setEntry(savedEntry);
        if (savedEntry) setStatus(savedEntry.status);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [game.id, session]);

  const saveEntry = async (
    nextStatus = status,
    favorite = entry?.favorite ?? false,
  ) => {
    if (!session) {
      navigate("/auth");
      return;
    }

    const previousEntry = entry;
    const payload: LibraryEntryInput = {
      game_name: game.name,
      game_slug: game.slug,
      background_image: game.background_image,
      status: nextStatus,
      favorite,
    };

    setSaving(true);

    try {
      const savedEntry = await saveLibraryEntry(game.id, payload);
      setEntry(savedEntry);
      setStatus(savedEntry.status);
      toast({
        title: "Library updated.",
        status: "success",
        duration: 1800,
      });
    } catch (error) {
      setEntry(previousEntry);
      if (previousEntry) setStatus(previousEntry.status);

      toast({
        title:
          error instanceof Error ? error.message : "Library update failed.",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (nextStatus: LibraryStatus) => {
    setStatus(nextStatus);
    void saveEntry(nextStatus);
  };

  const handleFavorite = () => {
    void saveEntry(status, !(entry?.favorite ?? false));
  };

  const handleRemove = async () => {
    if (!entry) return;

    const previousEntry = entry;
    setEntry(null);

    try {
      await deleteLibraryEntry(game.id);
      toast({
        title: "Removed from library.",
        status: "success",
        duration: 1800,
      });
    } catch (error) {
      setEntry(previousEntry);
      toast({
        title: error instanceof Error ? error.message : "Could not remove game.",
        status: "error",
      });
    }
  };

  if (!isSupabaseConfigured) return null;

  return (
    <HStack flexWrap="wrap">
      <Select
        width="180px"
        value={status}
        isDisabled={saving}
        onChange={(event) =>
          handleStatusChange(event.target.value as LibraryStatus)
        }
      >
        <option value="want_to_play">Want to play</option>
        <option value="playing">Playing</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </Select>

      <Button
        isLoading={saving}
        variant="outline"
        onClick={handleFavorite}
      >
        {entry?.favorite ? "★ Favorited" : "☆ Favorite"}
      </Button>

      {entry && (
        <Button colorScheme="red" variant="ghost" onClick={handleRemove}>
          Remove
        </Button>
      )}
    </HStack>
  );
}
