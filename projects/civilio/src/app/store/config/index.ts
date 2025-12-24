import { inject, Injectable } from '@angular/core';
import { CONFIG_SERVICE } from '@app/services/config';
import { dbConfig } from '@app/store/selectors';
import { sendRpcMessageAsync } from '@app/util';
import { TranslateService } from '@ngx-translate/core';
import {
	Action,
	NgxsOnInit,
	State,
	StateContext,
	Store
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import {
	catchError,
	concatMap,
	EMPTY,
	forkJoin,
	from,
	pipe,
	tap,
	throwError
} from 'rxjs';
import { CONFIG_STATE, ConfigStateModel } from '../models';
import {
	ApplyPendingMigrations,
	ClearConnections,
	DiscoverServer,
	InitChecks,
	IntrospectDb,
	LoadConfig,
	LoadKnownConnections,
	CheckServerStatus,
	RemoveConnection,
	SetFontSize,
	SetLocale,
	SetServerUrl,
	SetTheme,
	TestDb,
	UpdateMiscConfig,
	UseConnection,
	ConfigLoaded
} from './actions';

export * from './actions';

type Context = StateContext<ConfigStateModel>;

@Injectable()
@State({
	name: CONFIG_STATE,
	defaults: {
		connectionsLoaded: false,
		knownConnections: [],
		env: 'desktop',
		preInit: true,
		serverOnline: false
	}
})
export class ConfigState implements NgxsOnInit {
	private readonly store = inject(Store);
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

	@Action(CheckServerStatus)
	async onCheckServerStatus(ctx: Context) {
		const { config } = ctx.getState();
		const url = config?.api?.baseUrl;
		ctx.setState(patch({
			serverOnline: url ? await this.configService.pingServer(url) : false
		}));
	}

	@Action(SetServerUrl)
	async onSetServerUrl(ctx: Context, { url }: SetServerUrl) {
		const result = await this.configService.pingServer(url);
		if (result) {
			const result = await this.configService.setServerUrl(url);
			ctx.setState(patch({
				config: result,
				serverOnline: true
			}));
			return;
		}
		return throwError(() => new Error('Server unreachable'))
	}

	@Action(DiscoverServer)
	async onDiscoverServer(ctx: Context) {
		await sendRpcMessageAsync('discovery:init');
		ctx.dispatch(LoadConfig);
		ctx.setState(patch({
			serverOnline: true
		}))
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
		return ctx.dispatch(LoadConfig).pipe(
			concatMap(() => ctx.dispatch([CheckServerStatus, IntrospectDb, LoadKnownConnections]))
		);
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
			tap(() => ctx.dispatch(ConfigLoaded))
		)
	}
}
