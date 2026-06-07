import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, NgZone } from "@angular/core";
import { apiOrigin, machineId } from "@app/store/selectors";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Store } from "@ngxs/store";
import { Observable, Subscriber } from "rxjs";

@Injectable()
export class SseClient {
	private store = inject(Store);
	private ngZone = inject(NgZone);

	connect<T>(url: string): Observable<T> {
		return this.ngZone.runOutsideAngular(() => {
			return new Observable<T>((observer) => {
				const abortController = new AbortController();

				// 1. Mirror your interceptor's exact state resolution logic
				const origin = this.store.selectSnapshot(apiOrigin);
				const mid = this.store.selectSnapshot(machineId);

				// 2. Resolve the final URL using the browser's native URL constructor
				// If 'url' is '/api/stream' and 'origin' is 'https://myapi.com',
				// this safely resolves to 'https://myapi.com/api/stream'
				const finalUrl = origin ? new URL(url, origin).toString() : url;

				// 3. Build headers, mirroring your interceptor's Authorization setup
				const headers: Record<string, string> = {
					// 'Accept': 'text/event-stream'
				};
				if (mid) {
					headers['Authorization'] = mid;
				}

				// Kick off the background fetch stream
				this.startSseFetch(finalUrl, headers, abortController, observer);

				return () => {
					abortController.abort();
				};
			});
		});
	}

	private async startSseFetch<T>(
		url: string,
		headers: Record<string, string>,
		abortController: AbortController,
		observer: Subscriber<T>
	) {
		try {
			await fetchEventSource(url, {
				method: 'GET',
				headers: headers,
				signal: abortController.signal,
				onmessage: (msg) => {
					console.log(msg);
					if (msg.event === 'message' || !msg.event) {
						// Re-enter Angular zone only when pushing data back to the application state/UI
						this.ngZone.run(() => {
							observer.next(JSON.parse(msg.data));
						});
					}
				},
				onerror: (err) => {
					this.ngZone.run(() => observer.error(err));
				},
				onclose: () => {
					this.ngZone.run(() => observer.complete());
				}
			});
		} catch (error) {
			this.ngZone.run(() => observer.error(error));
		}
	}
}
export function provideSseClient(...providers: EnvironmentProviders[]) {
	return makeEnvironmentProviders([
		{
			provide: SseClient,
			multi: false
		},
		...providers
	])
};
