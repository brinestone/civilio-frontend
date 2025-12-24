import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { apiBaseUrl } from "@app/store/selectors";
import { sendRpcMessageAsync } from "@app/util";
import { ParsedLoginRequest, UserPrincipal } from "@civilio/shared";
import { Store } from "@ngxs/store";
import { lastValueFrom } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);
	private store = inject(Store);

	private get baseUrl() {
		const result = this.store.selectSnapshot(apiBaseUrl);
		if (!result) throw new Error('api base URL is not set');
		return result;
	}

	async logout() {
		await lastValueFrom(this.http.get(`${this.baseUrl}/auth/logout`));
	}

	async clearSavedCredentials() {
		return await sendRpcMessageAsync('credentials:clear')
	}

	async getSavedCredentials() {
		return await sendRpcMessageAsync('credentials:read');
	}

	async saveCredentials(username: string, password: string) {
		return await sendRpcMessageAsync('credentials:save', { username, password });
	}

	isAuthed() {
		return document.cookie?.includes('civilio_session') ?? false;
	}

	getMe() {
		if (!document.cookie) return null;
		const [_, encoded] = (document.cookie.split(';')
			.find(c => c.startsWith('civilio_session'))?.split('=') ?? [])

		if (!encoded) return null;
		const json = decodeURIComponent(encoded);
		return JSON.parse(json) as UserPrincipal;
	}

	loginUser(req: ParsedLoginRequest) {
		return this.http.post<UserPrincipal>(`${this.baseUrl}/auth/login`, req);
	}
}
