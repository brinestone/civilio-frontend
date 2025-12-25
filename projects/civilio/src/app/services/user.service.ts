import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { apiBaseUrl } from "@app/store/selectors";
import { UserInfo, UserInfoSchema } from "@civilio/shared";
import { select } from "@ngxs/store";
import { catchError, map, of, throwError } from "rxjs";


@Injectable({
	providedIn: 'root'
})
export class UserService {
	private http = inject(HttpClient);
	private baseUrl = select(apiBaseUrl);

	getAllUsers() {
		return this.http.get<UserInfo[]>(`${this.baseUrl()}/users`).pipe(
			map(v => UserInfoSchema.array().parse(v))
		)
	}

	findUserByUsername(username: string) {
		return this.http.get<UserInfo | null>(`${this.baseUrl()}/users/${encodeURIComponent(username)}`).pipe(
			catchError((e: HttpErrorResponse) => {
				if (e.status == 404) return of(null);
				return throwError(() => e)
			}),
			map(v => UserInfoSchema.nullable().parse(v))
		)
	}
}
