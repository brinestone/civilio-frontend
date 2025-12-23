import { inject, Injectable } from "@angular/core";
import { UserPrincipal } from "@civilio/shared";
import { Action, State, StateContext, StateToken } from "@ngxs/store";
import { LoginUser } from "./actions";
import { AuthService } from "@app/services/auth.service";
import { tap } from "rxjs";
import { patch } from "@ngxs/store/operators";

export * from './actions';

type AuthStateModel = {
	principal?: UserPrincipal;
};
export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
type Context = StateContext<AuthStateModel>;

@Injectable()
@State({
	name: AUTH_STATE,
	defaults: {
	}
})
export class AuthState {
	private authService = inject(AuthService);

	@Action(LoginUser, { cancelUncompleted: true })
	onLoginUser(ctx: Context, req: LoginUser) {
		return this.authService.loginUser(req).pipe(
			tap(principal => ctx.setState(patch({
				principal
			})))
		);
	}
}
