import { FastifyInstance } from 'fastify';
import { createSettingsHandlers } from '../handlers/settings';

export function registerSettingsRoutes(app: FastifyInstance) {
  const h = createSettingsHandlers(app);

  // Color scheme
  app.get('/admin-settings/color-scheme', h.getColorScheme);
  app.post<{ Body: { colorScheme?: unknown } }>('/admin-settings/color-scheme', h.setColorScheme);

  // Hidden accounts
  app.get('/admin-settings/hidden-accounts', h.getHiddenAccounts);
  app.post<{ Body: { accountId?: unknown } }>(
    '/admin-settings/hidden-accounts',
    h.addHiddenAccount,
  );
  app.delete<{ Params: { accountId: string } }>(
    '/admin-settings/hidden-accounts/:accountId',
    h.removeHiddenAccount,
  );
}
