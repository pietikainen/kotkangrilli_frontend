import { ActionIcon, Menu } from "@mantine/core";
import { IconPalette } from "@tabler/icons-react";
import { appThemes, isAppThemeId } from "../theme";
import { useAppTheme } from "../theme/context";

export default function ThemeSwitcher() {
  const { themeId, setThemeId } = useAppTheme();
  const options = Object.entries(appThemes);

  if (options.length < 2) return null;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="Vaihda ulkoasua">
          <IconPalette size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Ulkoasu</Menu.Label>
        <Menu.RadioGroup
          value={themeId}
          onChange={(id) => {
            if (isAppThemeId(id)) setThemeId(id);
          }}
        >
          {options.map(([id, option]) => (
            <Menu.RadioItem key={id} value={id} closeMenuOnClick>
              {option.label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Dropdown>
    </Menu>
  );
}
