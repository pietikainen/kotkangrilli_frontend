'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { Button, Menu, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme();

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>{computedColorScheme === 'dark' ? <IconSun /> : <IconMoon />}</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={() => setColorScheme('dark')}>Tumma</Menu.Item>
        <Menu.Item onClick={() => setColorScheme('light')}>Vaalea</Menu.Item>
        <Menu.Item onClick={() => setColorScheme('auto')}>Järjestelmä</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
