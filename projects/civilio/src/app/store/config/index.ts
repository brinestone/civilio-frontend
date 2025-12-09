import { inject, Injectable } from '@angular/core';
import { CONFIG_SERVICE } from '@app/services/config';
import {
	AppConfig,
	CheckMigrationsResponse,
	DbConnectionRef
} from '@civilio/shared';
import { TranslateService } from '@ngx-translate/core';
import {
	Action,
	NgxsOnInit,
	State,
	StateContext,
	StateToken
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { concatMap, forkJoin, from, tap, throwError } from 'rxjs';
import {
	ApplyPendingMigrations,
	ClearConnections,
	InitChecks,
	IntrospectDb,
	LoadConfig,
	LoadKnownConnections,
	RemoveConnection,
	SetFontSize,
	SetLocale,
	SetTheme,
	TestDb,
	UpdateMiscConfig,
	UseConnection
} from './actions';

export * from './actions';
type ConfigStateModel = {
	config?: AppConfig;
	knownConnections: DbConnectionRef[];
	env: 'desktop' | 'web';
	migrationState?: CheckMigrationsResponse;
	preInit: boolean;
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@Injectable()
@State({
	name: CONFIG_STATE,
	defaults: { knownConnections: [], env: 'desktop', preInit: true }
})
export class ConfigState implements NgxsOnInit {
	private readonly configService = inject(CONFIG_SERVICE);
	private readonly translateService = inject(TranslateService);

	ngxsOnInit(ctx: Context): void {
		const state = ctx.getState();
		const lang = (state.config?.prefs?.locale ?? 'en-CM').substring(0, 2);
		this.translateService.use(lang);
		ctx.dispatch(InitChecks).subscribe({
			complete: () => {
				ctx.setState(patch({
					preInit: false
				}))
			}
		});
	}

	@Action(ClearConnections)
	async onClearConnections(ctx: Context) {
		await this.configService.clearConnections();
		ctx.dispatch(LoadKnownConnections);
	}

	@Action(RemoveConnection)
	async onRemoveConnection(ctx: Context, action: RemoveConnection) {
		await this.configService.removeConnectionById(action.id);
		ctx.dispatch(LoadKnownConnections);
	}

	@Action(UseConnection)
	async onUseConnection(ctx: Context, action: UseConnection) {
		const state = ctx.getState();
		state.migrationState = undefined;
		ctx.setState({ ...state });
		await this.configService.useConnection(action.id);
		ctx.dispatch([IntrospectDb, LoadKnownConnections]);
	}

	@Action(LoadKnownConnections)
	onLoadKnownConnections(ctx: Context) {
		return from(this.configService.findConnectionHistory()).pipe(
			tap(c => ctx.setState(patch({
				knownConnections: c
			})))
		)
	}

	@Action(ApplyPendingMigrations)
	async onApplyPendingMigrations(ctx: Context) {
		const result = await this.configService.applyPendingMigrations();
		ctx.setState(patch({
			migrationState: result
		}));
	}

	@Action(InitChecks)
	onInitChecks(ctx: Context) {
		ctx.dispatch([LoadConfig, IntrospectDb, LoadKnownConnections])
	}

	@Action(IntrospectDb)
	onIntrospectDb(ctx: Context) {
		return from(this.configService.checkMigrations()).pipe(
			tap(response => ctx.setState(patch({
				migrationState: response
			})))
		);
	}

	@Action(UpdateMiscConfig)
	onUpdateMiscConfig(ctx: Context, { path, value }: UpdateMiscConfig) {
		return from(this.configService.updateMisc(path, value)).pipe(
			tap(config => ctx.setState(patch({
				config,
			}))),
		);
	}

	@Action(SetFontSize)
	onSetFontSize(ctx: Context, { size }: SetFontSize) {
		return from(this.configService.setFontSize(size)).pipe(
			tap(config => ctx.setState(patch({
				config,
			})))
		)
	}

	@Action(TestDb, { cancelUncompleted: true })
	onTestDb(ctx: Context, action: TestDb) {
		const state = ctx.getState();
		state.migrationState = undefined;
		ctx.setState({ ...state });
		return from(this.configService.testDb(action)).pipe(
			concatMap(v => {
				if (v === true) return this.configService.setDbConfig(action);
				return throwError(() => new Error(v));
			}),
			tap(config => ctx.setState(patch({
				config: config ?? undefined,
			}))),
			tap(() => ctx.dispatch([IntrospectDb, LoadKnownConnections]))
		)
	}

	@Action(SetLocale, { cancelUncompleted: true })
	onSetLocale(ctx: Context, { locale }: SetLocale) {
		return from(this.configService.setLocale(locale)).pipe(
			tap(config => ctx.setState(patch({
				config,
			}))),
			tap(() => this.translateService.use(locale.substring(0, 2)))
		)
	}

	@Action(SetTheme, { cancelUncompleted: true })
	onSetTheme(ctx: Context, { value }: SetTheme) {
		return from(this.configService.setTheme(value)).pipe(
			tap(config => ctx.setState(patch({
				config,
			}))),
		);
	}

	@Action(LoadConfig)
	onLoadConfig(ctx: Context) {
		return forkJoin([
			this.configService.loadConfig(),
		]).pipe(
			tap(([config]) => ctx.setState(patch({
				config,
			}))),
			tap(([config]) => {
				const lang = (config?.prefs?.locale ?? 'en-CM').substring(0, 2);
				this.translateService.use(lang);
			}),
		)
	}
}
