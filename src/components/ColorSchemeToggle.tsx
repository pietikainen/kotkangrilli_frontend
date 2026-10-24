import {
  ActionIcon,
  Menu,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import React from "react";

export default function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="Vaihda väriteemaa">
          {computedColorScheme === "dark" ? (
            <IconMoon size={18} />
          ) : (
            <IconSun size={18} />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Väriteema</Menu.Label>
        <Menu.Item
          leftSection={<IconMoon size={16} />}
          rightSection={colorScheme === "dark" ? <IconCheck size={14} /> : null}
          onClick={() => setColorScheme("dark")}
        >
          Tumma
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSun size={16} />}
          rightSection={
            colorScheme === "light" ? <IconCheck size={14} /> : null
          }
          onClick={() => setColorScheme("light")}
        >
          Vaalea
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={16} />}
          rightSection={colorScheme === "auto" ? <IconCheck size={14} /> : null}
          onClick={() => setColorScheme("auto")}
        >
          Järjestelmä
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
