import { HStack, Switch, Text, useColorMode } from "@chakra-ui/react";

const ColorModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <HStack>
      <Switch
        colorScheme="blue"
        isChecked={isDark}
        onChange={toggleColorMode}
        aria-label="Toggle dark mode"
      />
      <Text whiteSpace="nowrap">{isDark ? "DARK" : "LIGHT"} MODE</Text>
    </HStack>
  );
};

export default ColorModeSwitch;
