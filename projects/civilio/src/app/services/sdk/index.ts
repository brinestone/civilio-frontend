import { Injectable, makeEnvironmentProviders } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { apiOrigin } from "@app/store/selectors";
import { CivilioSdk, createCivilioSdk } from '@civilio/sdk';
import { AnonymousAuthenticationProvider } from "@microsoft/kiota-abstractions";
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { Store } from "@ngxs/store";


@Injectable({ providedIn: null })
export class SdkService {
	public readonly client: CivilioSdk;
	constructor(store: Store) {
		const adapter = new FetchRequestAdapter(new AnonymousAuthenticationProvider());
		this.client = createCivilioSdk(adapter);
		store.select(apiOrigin).pipe(
			takeUntilDestroyed(),
		).subscribe(origin => adapter.baseUrl = origin);
	}
}

export function provideCivilioSdk() {
	return makeEnvironmentProviders([
		{
			provide: SdkService,
			useClass: SdkService,
			multi: false
		}
	])
}
