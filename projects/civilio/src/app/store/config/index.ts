import { inject, Injectable } from '@angular/core';
import { ClientFetchAdapter } from '@app/adapters/sdk';
import { CONFIG_SERVICE } from '@app/services/config';
import { dbConfig } from '@app/store/selectors';
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
	StateToken,
	Store
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import {
	catchError,
	concatMap,
	EMPTY,
	forkJoin,
	from,
	tap,
	throwError
} from 'rxjs';
import {
	ApplyPendingMigrations,
	ClearConnections,
	DiscoverServer,
	InitChecks,
	IntrospectDb,
	LoadConfig,
	LoadKnownConnections,
	RemoveConnection,
	SetFontSize,
	SetLocale,
	SetServerUrl,
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
	connectionsLoaded: boolean;
	serverOnline: boolean;
}
type Context = StateContext<ConfigStateModel>;
export const CONFIG_STATE = new StateToken<ConfigStateModel>('config');

@Injectable()
@State({
	name: CONFIG_STATE,
	defaults: {
		connectionsLoaded: false,
		knownConnections: [],
		env: 'desktop',
		preInit: true,
		serverOnline: false,
	}
})
export class ConfigState implements NgxsOnInit {
	private readonly store = inject(Store);
	private readonly configService = inject(CONFIG_SERVICE);
	private readonly translateService = inject(TranslateService);
	private readonly fetchAdapter = inject(ClientFetchAdapter);

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

	@Action(SetServerUrl)
	async onSetServerUrl(ctx: Context, { url }: SetServerUrl) {
		const result = await this.configService.setServerUrl(url);
		ctx.setState(patch({
			config: result
		}));
		this.fetchAdapter.baseUrl = new URL(url).origin;
	}

	@Action(DiscoverServer)
	async onDiscoverServer(ctx: Context) {
		const response = await this.configService.discoverServer();
		ctx.setState(patch({
			config: patch({
				apiServer: response,
			}),
			serverOnline: true
		}));
		this.fetchAdapter.baseUrl = new URL(response.baseUrl).origin;
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
				knownConnections: c,
				connectionsLoaded: true
			}))),
			catchError(e => {
				ctx.setState(patch({
					connectionsLoaded: true
				}));
				return throwError(() => e);
			})
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
		ctx.dispatch([LoadConfig, DiscoverServer, IntrospectDb, LoadKnownConnections]);
	}

	@Action(IntrospectDb)
	onIntrospectDb(ctx: Context) {
		const currentParams = this.store.selectSnapshot(dbConfig);
		if (currentParams?.migrated) return EMPTY;
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
		return from(this.configService.loadConfig()).pipe(
			tap((config) => ctx.setState(patch({
				config,
			}))),
			tap((config) => {
				const lang = (config?.prefs?.locale ?? 'en-CM').substring(0, 2);
				this.translateService.use(lang);
			}),
			tap(config => {
				if (!config.apiServer) return;
				this.fetchAdapter.baseUrl = new URL(config.apiServer.baseUrl).origin;
			})
		)
	}
}
