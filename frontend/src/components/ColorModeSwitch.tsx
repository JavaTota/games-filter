import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ColorModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip label={label} hasArrow>
      <IconButton
        aria-label={label}
        icon={isDark ? <FiSun /> : <FiMoon />}
        variant="ghost"
        size="sm"
        color="inherit"
        onClick={toggleColorMode}
      />
    </Tooltip>
  );
}
