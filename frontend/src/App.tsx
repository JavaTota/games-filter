import { Box } from "@chakra-ui/react";

import NavBar from "./components/NavBar";
import { useRouter } from "./lib/router";
import AuthPage from "./pages/AuthPage";
import ComparePage from "./pages/ComparePage";
import DiscoverPage from "./pages/DiscoverPage";
import GameDetailPage from "./pages/GameDetailPage";
import LibraryPage from "./pages/LibraryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { pathname } = useRouter();
  const gameRoute = pathname.match(/^\/games\/(\d+)(?:\/[^/]+)?$/);

  const renderPage = () => {
    if (pathname === "/") return <DiscoverPage />;
    if (pathname === "/compare") return <ComparePage />;
    if (pathname === "/library") return <LibraryPage />;
    if (pathname === "/profile") return <ProfilePage />;
    if (pathname === "/auth") return <AuthPage />;

    if (gameRoute) {
      return <GameDetailPage gameId={Number(gameRoute[1])} />;
    }

    return <NotFoundPage />;
  };

  return (
    <Box minH="100vh">
      <NavBar />
      {renderPage()}
    </Box>
  );
}

export default App;
