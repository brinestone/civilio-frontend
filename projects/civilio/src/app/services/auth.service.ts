import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { apiBaseUrl } from "@app/store/selectors";
import { ParsedLoginRequest, UserPrincipal } from "@civilio/shared";
import { Store } from "@ngxs/store";

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

	loginUser(req: ParsedLoginRequest) {
		return this.http.post<UserPrincipal>(new URL('/auth/login', this.baseUrl).toString(), req);
	}
}
