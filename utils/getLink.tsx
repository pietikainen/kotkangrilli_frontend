import { SiEpicgames, SiGogdotcom, SiUbisoft } from '@icons-pack/react-simple-icons';
import { IconBrandSteam, IconBrandXbox, IconLink, IconLinkOff } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';

// eslint-disable-next-line import/prefer-default-export
export function getLink(link: string | null | undefined) {
  if (link) {
    if (link.includes('steampowered.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <IconBrandSteam />
        </ActionIcon>
      );
    }
    if (link.includes('gog.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiGogdotcom />
        </ActionIcon>
      );
    }
    if (link.includes('epicgames.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiEpicgames />
        </ActionIcon>
      );
    }
    if (link.includes('ubisoft.com') || link.includes('ubi.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiUbisoft />
        </ActionIcon>
      );
    }
    if (link.includes('xbox.com') || link.includes('microsoft.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <IconBrandXbox />
        </ActionIcon>
      );
    }
    return (
      <ActionIcon component="a" href={link} target="_blank">
        <IconLink />
      </ActionIcon>
    );
  }

  return <IconLinkOff />;
}
