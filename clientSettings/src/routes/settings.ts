import { FastifyInstance } from 'fastify';
import { createSettingsHandlers } from '../handlers/settings';

export function registerSettingsRoutes(app: FastifyInstance) {
  const h = createSettingsHandlers(app);

  // Color scheme
  app.get('/client-settings/color-scheme', h.getColorScheme);
  app.post<{ Body: { colorScheme?: unknown } }>('/client-settings/color-scheme', h.setColorScheme);

  // Hidden accounts
  app.get('/client-settings/hidden-accounts', h.getHiddenAccounts);
  app.post<{ Body: { accountId?: unknown } }>(
    '/client-settings/hidden-accounts',
    h.addHiddenAccount,
  );
  app.delete<{ Params: { accountId: string } }>(
    '/client-settings/hidden-accounts/:accountId',
    h.removeHiddenAccount,
  );
}
