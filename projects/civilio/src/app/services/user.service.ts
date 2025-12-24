import { HttpClient } from "@angular/common/http";
import { inject, Injectable, Provider } from "@angular/core";
import { apiBaseUrl } from "@app/store/selectors";
import { UserInfo } from "@civilio/shared";
import { select } from "@ngxs/store";

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private http = inject(HttpClient);
	private baseUrl = select(apiBaseUrl);

	getAllUsers() {
		return this.http.get<UserInfo[]>(`${this.baseUrl()}/users`)
	}
}
