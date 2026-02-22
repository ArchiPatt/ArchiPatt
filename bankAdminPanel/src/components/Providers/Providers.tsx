import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
        {children}
      <Notifications />
    </MantineProvider>
  );
};
