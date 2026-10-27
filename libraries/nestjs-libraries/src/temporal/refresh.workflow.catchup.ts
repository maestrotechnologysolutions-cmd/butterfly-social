import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';
import { IntegrationRepository } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.repository';
import { socialIntegrationList } from '@gitroom/nestjs-libraries/integrations/integration.manager';

@Injectable()
export class RefreshWorkflowCatchupRegister implements OnModuleInit {
  constructor(
    private _temporalService: TemporalService,
    private _integrationRepository: IntegrationRepository
  ) {}

  // Refresh workflows are started at connect time, so integrations connected
  // BEFORE a provider gained refreshCron support never get one. On boot,
  // (re)start the refresh workflow for every live integration whose provider
  // refreshes. The deterministic `refresh_<id>` workflowId plus
  // TERMINATE_EXISTING makes this idempotent — at most one workflow per
  // integration ever exists.
  async onModuleInit(): Promise<void> {
    if (!process.env.RUN_CRON) {
      return;
    }

    try {
      const integrations =
        await this._integrationRepository.getAllIntegrationsForRefreshCatchup();
      const refreshProviders = new Map(
        socialIntegrationList
          .filter((f) => f.refreshCron)
          .map((f) => [f.identifier, f])
      );

      let started = 0;
      for (const integration of integrations) {
        if (!refreshProviders.has(integration.providerIdentifier)) {
          continue;
        }

        await this._temporalService.client
          ?.getRawClient()
          ?.workflow?.start('refreshTokenWorkflow', {
            workflowId: `refresh_${integration.id}`,
            args: [
              {
                integrationId: integration.id,
                organizationId: integration.organizationId,
              },
            ],
            taskQueue: 'main',
            workflowIdConflictPolicy: 'TERMINATE_EXISTING',
          });
        started++;
      }

      console.log(
        `[refresh-catchup] started ${started} refresh workflow(s) out of ${integrations.length} live integration(s)`
      );
    } catch (err) {
      // Never block backend boot over catch-up — connect-time starts and the
      // next reboot will cover the gap.
      console.log('[refresh-catchup] failed:', err);
    }
  }
}

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [RefreshWorkflowCatchupRegister],
  get exports() {
    return this.providers;
  },
})
export class RefreshWorkflowCatchupModule {}
