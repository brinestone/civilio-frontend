import { inject, Injectable } from '@angular/core';
import { AppConfig, AppConfigSchema } from '@civilio/shared';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { from, tap } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { LoadConfig, SetLocale, SetTheme } from './actions';

export * from './actions';
type ConfigStateModel = {
  config?: AppConfig;
  configured: boolean;
  env: 'desktop' | 'web';
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@State({
  name: CONFIG_STATE,
  defaults: { configured: false, env: 'desktop' }
})
@Injectable()
export class ConfigState {
  private readonly configService = inject(ConfigService);

  @Action(SetLocale, { cancelUncompleted: true })
  onSetLocale(ctx: Context, { locale }: SetLocale) {
    return from(this.configService.setLocale(locale)).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: 'db' in config && AppConfigSchema.unwrap().shape.db.unwrap().safeParse(config.db).success
      })))
    )
  }

  @Action(SetTheme, { cancelUncompleted: true })
  onSetTheme(ctx: Context, { value }: SetTheme) {
    return from(this.configService.setTheme(value)).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: 'db' in config && AppConfigSchema.unwrap().shape.db.unwrap().safeParse(config.db).success
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
