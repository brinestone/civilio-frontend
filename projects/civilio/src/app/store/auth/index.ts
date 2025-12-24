import { inject, Injectable } from "@angular/core";
import { AuthService } from "@app/services/auth.service";
import { pause } from "@civilio/shared";
import { Action, NgxsOnInit, State, StateContext } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { concatMap, tap } from "rxjs";
import { ConfigLoaded } from "../config";
import { AUTH_STATE, AuthStateModel } from "../models";
import { LoggedOut, LoginUser, ReSignIn } from "./actions";

export * from './actions';

type Context = StateContext<AuthStateModel>;

@Injectable()
@State({
	name: AUTH_STATE,
	defaults: {
		credentialsSaved: false
	}
})
export class AuthState implements NgxsOnInit {
	private authService = inject(AuthService);

	async ngxsOnInit(ctx: Context) {
	}

	@Action(ReSignIn)
	async onReSignIn(ctx: Context, action: ReSignIn) {
		pause(30000)
	}

	@Action(LoggedOut)
	async onLoggedOut(ctx: Context, action: LoggedOut) {
		if (action.clearCredentials) {
			await this.authService.clearSavedCredentials();
			ctx.setState(patch({
				principal: undefined
			}))
		}
	}

	@Action(LoginUser, { cancelUncompleted: true })
	onLoginUser(ctx: Context, req: LoginUser) {
		return this.authService.loginUser(req).pipe(
			tap(principal => ctx.setState(patch({
				principal
			}))),
			concatMap(() => this.authService.saveCredentials(req.username, req.password))
		);
	}
}
