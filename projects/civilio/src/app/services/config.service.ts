import { Injectable } from '@angular/core';
import { sendRpcAndWaitAsync } from '../util/rpc';
import { AppConfigSchema } from '@civilio/shared';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  async loadConfig() {
    return await sendRpcAndWaitAsync('config:read', 5000).then(AppConfigSchema.parse);
  }
}
