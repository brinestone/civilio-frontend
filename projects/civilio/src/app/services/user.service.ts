import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { apiBaseUrl } from "@app/store/selectors";
import { UserInfo, UserInfoSchema } from "@civilio/shared";
import { select } from "@ngxs/store";
import { omit } from "lodash";
import { catchError, map, of, throwError } from "rxjs";
import z from "zod";

const createUserRequestSchema = z.object({
	names: z.coerce.string(),
	email: z.coerce.string(),
	role: z.coerce.string(),
	username: z.coerce.string(),
	password: z.coerce.string(),
});

const updateUserRequestSchema = createUserRequestSchema.partial();

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private http = inject(HttpClient);
	private baseUrl = select(apiBaseUrl);

	deleteUser(username: string) {
		return this.http.delete(`${this.baseUrl()}/users/${username}`);
	}

	createUser(input: z.infer<typeof createUserRequestSchema>) {
		return this.http.post(`${this.baseUrl()}/users`, input);
	}

	updateUser(userId: string, update: z.infer<typeof updateUserRequestSchema>) {
		if (update.password && update.password.length == 0) {
			return this.http.patch(`${this.baseUrl()}/users/${userId}`, omit(update, 'password'))
		}
		return this.http.patch(`${this.baseUrl()}/users/${userId}`, update);
	}

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
