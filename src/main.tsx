import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "./index.css";
import App from "./App";
import theme from "./theme";
import { RouterProvider } from "./lib/router";
import { AuthProvider } from "./context/AuthContext";
import { CompareProvider } from "./context/CompareContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <RouterProvider>
        <AuthProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </AuthProvider>
      </RouterProvider>
    </ChakraProvider>
  </StrictMode>
);
