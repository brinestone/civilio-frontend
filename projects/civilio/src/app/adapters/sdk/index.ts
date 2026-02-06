import { inject, Injectable, InjectionToken, makeEnvironmentProviders, OnDestroy } from "@angular/core";
import { DatasetService } from "@app/services/dataset";
import { CivilioClient, createCivilioClient } from '@civilio/sdk';
import { AnonymousAuthenticationProvider, RequestAdapter } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";

@Injectable({ providedIn: null })
class SdkClientWrapper implements OnDestroy {
	private readonly adapter = inject(SdkRequestAdapter);
	readonly client: CivilioClient;
	constructor() {
		this.client = createCivilioClient(this.adapter);
	}
	ngOnDestroy(): void {
	}
}
export const SdkRequestAdapter = new InjectionToken<RequestAdapter>('api.fetch.adapter');
export const CivilioSdk = new InjectionToken<{ client: CivilioClient }>('api.sdk');

export function provideCivilioSdk() {
	return makeEnvironmentProviders([
		{ provide: DatasetService, multi: false },
		{
			provide: SdkRequestAdapter,
			useValue: new FetchRequestAdapter(new AnonymousAuthenticationProvider())
		},
		{
			provide: CivilioSdk,
			useClass: SdkClientWrapper,
			multi: false
		}
	])
}
