import { Button, HStack, Select, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { GameDetail } from "../types/game";
import type { LibraryEntry, LibraryEntryInput, LibraryStatus } from "../types/community";
import { deleteLibraryEntry, getLibraryEntry, saveLibraryEntry } from "../services/communityService";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../services/supabaseClient";
import { useRouter } from "../lib/router";

export default function LibraryControls({ game }: { game: GameDetail }) {
  const { session } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [status, setStatus] = useState<LibraryStatus>("want_to_play");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session || !isSupabaseConfigured) return;
    getLibraryEntry(game.id).then((current) => {
      setEntry(current);
      if (current) setStatus(current.status);
    }).catch(() => undefined);
  }, [session, game.id]);

  /** Optimistic UI keeps controls responsive; FastAPI + RLS remain authoritative. */
  const persist = async (nextStatus = status, favorite = entry?.favorite ?? false) => {
    if (!session) { navigate("/auth"); return; }
    const previous = entry;
    const payload: LibraryEntryInput = {
      game_name: game.name,
      game_slug: game.slug,
      background_image: game.background_image,
      status: nextStatus,
      favorite,
    };
    setEntry(previous ? { ...previous, ...payload } : null);
    setSaving(true);
    try {
      setEntry(await saveLibraryEntry(game.id, payload));
      toast({ title: "Library updated.", status: "success", duration: 1800 });
    } catch (error) {
      setEntry(previous);
      if (previous) setStatus(previous.status);
      toast({ title: error instanceof Error ? error.message : "Library update failed.", status: "error" });
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!entry) return;
    const previous = entry;
    setEntry(null);
    try { await deleteLibraryEntry(game.id); toast({ title: "Removed from library.", status: "success", duration: 1800 }); }
    catch (error) { setEntry(previous); toast({ title: error instanceof Error ? error.message : "Could not remove game.", status: "error" }); }
  };

  if (!isSupabaseConfigured) return null;
  return (
    <HStack flexWrap="wrap">
      <Select width="180px" value={status} isDisabled={saving} onChange={(e) => { const next = e.target.value as LibraryStatus; setStatus(next); void persist(next); }}>
        <option value="want_to_play">Want to play</option><option value="playing">Playing</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
      </Select>
      <Button isLoading={saving} variant="outline" onClick={() => void persist(status, !(entry?.favorite ?? false))}>{entry?.favorite ? "★ Favorited" : "☆ Favorite"}</Button>
      {entry && <Button colorScheme="red" variant="ghost" onClick={() => void remove()}>Remove</Button>}
    </HStack>
  );
}
