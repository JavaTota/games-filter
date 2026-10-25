import { Box } from "@chakra-ui/react";

import NavBar from "./components/NavBar";
import { useRouter } from "./lib/useRouter";
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
    <Box minH="100vh" bg="pageBg" color="textPrimary" position="relative">
      <Box
        position="fixed"
        inset="0"
        pointerEvents="none"
        opacity="0.7"
        bgImage="radial-gradient(circle at 8% 12%, rgba(66,107,250,.12), transparent 30%), radial-gradient(circle at 88% 28%, rgba(139,92,246,.10), transparent 26%)"
      />
      <NavBar />
      <Box position="relative" zIndex="1">
        {renderPage()}
      </Box>
    </Box>
  );
}

export default App;
