import { inject, Injectable } from '@angular/core';
import { AppConfig, AppConfigSchema, DbConfigSchema } from '@civilio/shared';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { concatMap, from, tap, throwError } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { LoadConfig, SetLocale, SetTheme, TestDb } from './actions';

export * from './actions';
type ConfigStateModel = {
  config?: AppConfig;
  configured: boolean;
  env: 'desktop' | 'web';
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@Injectable()
@State({
  name: CONFIG_STATE,
  defaults: { configured: false, env: 'desktop' }
})
export class ConfigState {
  private readonly configService = inject(ConfigService);

  @Action(TestDb, { cancelUncompleted: true })
  onTestDb(ctx: Context, action: TestDb) {
    return from(this.configService.testDb(action)).pipe(
      concatMap(v => {
        if (v === true) return this.configService.setDbConfig(action);
        return throwError(() => new Error(v));
      }),
      tap(config => ctx.setState(patch({
        config,
        configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
      })))
    )
  }

  @Action(SetLocale, { cancelUncompleted: true })
  onSetLocale(ctx: Context, { locale }: SetLocale) {
    return from(this.configService.setLocale(locale)).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
      })))
    )
  }

  @Action(SetTheme, { cancelUncompleted: true })
  onSetTheme(ctx: Context, { value }: SetTheme) {
    return from(this.configService.setTheme(value)).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: 'db' in config && DbConfigSchema.safeParse(config.db).success
      })))
    );
  }

  @Action(LoadConfig)
  onLoadConfig(ctx: Context) {
    return from(this.configService.loadConfig()).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: config && config.db && Object.keys(config.db ?? {}).length > 0 && AppConfigSchema.unwrap().shape.db.unwrap().safeParse(config.db).success
      })))
    )
  }
}
