import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { CivilioSdk, createCivilioSdk } from '@civilio/sdk';
import { AnonymousAuthenticationProvider } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";

export const ClientSdk = new InjectionToken<CivilioSdk>('sdk');

export function provideClientSdk() {
	return makeEnvironmentProviders([
		{
			provide: ClientSdk,
			useFactory: () => {
				const authProvider = new AnonymousAuthenticationProvider();
				const adapter = new FetchRequestAdapter(authProvider, );
				return createCivilioSdk(adapter);
			},
			multi: false
		}
	])
}
