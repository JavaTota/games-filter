import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#EEF4FF",
      100: "#D9E6FF",
      200: "#B9D0FF",
      300: "#8DB0FF",
      400: "#648EFF",
      500: "#426BFA",
      600: "#3152E5",
      700: "#2941B8",
      800: "#283990",
      900: "#263474",
    },
  },
  semanticTokens: {
    colors: {
      pageBg: { default: "#F4F7FB", _dark: "#070A11" },
      surface: { default: "#FFFFFF", _dark: "#111827" },
      surfaceElevated: { default: "#FFFFFF", _dark: "#151D2E" },
      surfaceMuted: { default: "#EEF2F8", _dark: "#0D1421" },
      inputBg: { default: "#FFFFFF", _dark: "#0B1220" },
      textPrimary: { default: "#0F172A", _dark: "#F8FAFC" },
      textSecondary: { default: "#475569", _dark: "#CBD5E1" },
      textMuted: { default: "#64748B", _dark: "#A8B4C6" },
      borderSubtle: { default: "#D8E0EC", _dark: "#283449" },
      navBg: {
        default: "rgba(255,255,255,0.92)",
        _dark: "rgba(7,10,17,0.90)",
      },
      linkColor: { default: "#3152E5", _dark: "#8DB0FF" },
    },
  },
  fonts: {
    heading:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: {
      "html, body, #root": {
        minHeight: "100%",
      },
      body: {
        bg: "pageBg",
        color: "textPrimary",
      },
      "select option": {
        background: "#111827",
        color: "#F8FAFC",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "700",
        borderRadius: "xl",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "surface",
          color: "textPrimary",
          borderWidth: "1px",
          borderColor: "borderSubtle",
          borderRadius: "2xl",
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "inputBg",
            color: "textPrimary",
            borderColor: "borderSubtle",
            _placeholder: { color: "textMuted" },
            _hover: { borderColor: "brand.400" },
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "inputBg",
            color: "textPrimary",
            borderColor: "borderSubtle",
            _hover: { borderColor: "brand.400" },
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "inputBg",
          color: "textPrimary",
          borderColor: "borderSubtle",
          _placeholder: { color: "textMuted" },
          _hover: { borderColor: "brand.400" },
          _focusVisible: {
            borderColor: "brand.400",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
          },
        },
      },
    },
  },
});

export default theme;
