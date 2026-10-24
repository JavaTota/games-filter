import { Box } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import { useRouter } from "./lib/router";
import DiscoverPage from "./pages/DiscoverPage";
import GameDetailPage from "./pages/GameDetailPage";
import ComparePage from "./pages/ComparePage";
import LibraryPage from "./pages/LibraryPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

/** Explicit route matching keeps the small SPA map understandable without a router dependency. */
function App() {
  const { pathname } = useRouter();
  const gameMatch = pathname.match(/^\/games\/(\d+)(?:\/[^/]+)?$/);

  let page = <NotFoundPage />;
  if (pathname === "/") page = <DiscoverPage />;
  else if (gameMatch) page = <GameDetailPage gameId={Number(gameMatch[1])} />;
  else if (pathname === "/compare") page = <ComparePage />;
  else if (pathname === "/library") page = <LibraryPage />;
  else if (pathname === "/profile") page = <ProfilePage />;
  else if (pathname === "/auth") page = <AuthPage />;

  return <Box minH="100vh"><NavBar />{page}</Box>;
}

export default App;
