import { inject, InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { CivilioSdk, createCivilioSdk } from '@civilio/sdk';
import { AnonymousAuthenticationProvider, RequestAdapter } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";

export const ClientSdk = new InjectionToken<CivilioSdk>('sdk');
export const ClientFetchAdapter = new InjectionToken<RequestAdapter>('fetch-adapter');

export function provideClientSdk() {
	return makeEnvironmentProviders([
		{
			provide: ClientFetchAdapter,
			multi: false,
			useFactory: () => new FetchRequestAdapter(new AnonymousAuthenticationProvider())
		},
		{
			provide: ClientSdk,
			useFactory: () => {
				const adapter = inject(ClientFetchAdapter);

				return createCivilioSdk(adapter);
			},
			multi: false
		}
	])
}
