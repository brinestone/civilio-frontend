import { AppConfig, AppConfigSchema } from '@civilio/shared';
import { Action, NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { LoadConfig } from './actions';
import { from, tap } from 'rxjs';
import { patch } from '@ngxs/store/operators';

export * from './actions';
type ConfigStateModel = {
  config?: AppConfig;
  configured: boolean;
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@State({
  name: CONFIG_STATE,
  defaults: { configured: false }
})
@Injectable()
export class ConfigState implements NgxsOnInit {
  private readonly configService = inject(ConfigService);
  ngxsOnInit(ctx: StateContext<any>): void {
    ctx.dispatch(LoadConfig)
  }

  @Action(LoadConfig)
  onLoadConfig(ctx: Context) {
    return from(this.configService.loadConfig()).pipe(
      tap(config => ctx.setState(patch({
        config,
        configured: config && config.db && Object.keys(config.db).length > 0 && AppConfigSchema.unwrap().shape.db.unwrap().safeParse(config.db).success
      })))
    )
  }
}
