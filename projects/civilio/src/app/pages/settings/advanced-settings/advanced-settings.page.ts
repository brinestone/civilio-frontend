import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
	ApplyPendingMigrations,
	ClearConnections,
	IntrospectDb,
	RemoveConnection,
	TestDb,
	UseConnection
} from '@app/store/config';
import { connections, dbConfig, migrationNeeded } from '@app/store/selectors';
import { isActionLoading } from '@app/util';
import { TestDbConnectionRequestSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideCheck,
	lucideDatabase,
	lucideHistory,
	lucideLoader,
	lucideSave,
	lucideServer
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import {
	Actions,
	dispatch,
	ofActionCompleted,
	ofActionDispatched,
	select
} from '@ngxs/store';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmItemImports } from '@spartan-ng/helm/item';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmH3, HlmH4 } from '@spartan-ng/helm/typography';
import { toast } from 'ngx-sonner';
import { map, merge, startWith } from 'rxjs';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { AgoDatePipePipe } from '@app/pipes';

@Component({
	selector: 'cv-advanced-settings',
	viewProviders: [
		provideIcons({
			lucideDatabase,
			lucideCheck,
			lucideHistory,
			lucideServer,
			lucideSave,
			lucideLoader
		})
	],
	imports: [
		NgIcon,
		HlmCheckbox,
		FormsModule,
		HlmLabel,
		HlmInput,
		HlmEmptyImports,
		HlmButton,
		TranslatePipe,
		HlmAlertImports,
		HlmItemImports,
		HlmH4,
		HlmH3,
		AgoDatePipePipe,
		HlmBadge
	],
	host: {
		'class': 'page'
	},
	templateUrl: './advanced-settings.page.html',
	styleUrl: './advanced-settings.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedSettingsPage {
	protected readonly connectionHistory = select(connections);
	protected readonly migrationNeeded = select(migrationNeeded);
	protected readonly introspectingDb = signal(false);
	protected readonly applyingMigrations = isActionLoading(ApplyPendingMigrations);
	protected readonly testingDbConnection = isActionLoading(TestDb);
	protected readonly applyMigrations = dispatch(ApplyPendingMigrations);
	private cdr = inject(ChangeDetectorRef);
	private readonly dbConfig = select(dbConfig);
	protected readonly fieldSchema = computed(() => {
		const config = this.dbConfig();
		return [
			{
				label: 'settings.advanced.db.host',
				key: 'host',
				type: 'text',
				default: config?.host ?? 'localhost',
				icon: 'lucideServer',
				hint: 'The database\'s hostname or IP address',
				required: true
			},
			{
				label: 'settings.advanced.db.port',
				key: 'port',
				type: 'number',
				required: true,
				default: Number(config?.port ?? 5432)
			},
			{
				label: 'settings.advanced.db.name',
				key: 'database',
				type: 'text',
				default: config?.database ?? 'postgres',
				required: true,
				hint: 'The name of the database to use'
			},
			{
				label: 'settings.advanced.db.user',
				key: 'username',
				default: config?.username ?? 'postgres',
				type: 'text',
				icon: 'lucideUser',
				hint: 'The username to use to connect to the database server',
				required: true
			},
			{
				label: 'settings.advanced.db.pwd',
				key: 'password',
				type: 'password',
				hint: 'The password ot use to connect to the database server',
				required: true,
				default: ''
			},
			{
				label: 'settings.advanced.db.ssl',
				key: 'ssl',
				type: 'checkbox',
				required: false,
				default: config?.ssl ?? false
			}
		]
	});
	private readonly ts = inject(TranslateService);
	private readonly removeConnection = dispatch(RemoveConnection);
	private readonly clearConnections = dispatch(ClearConnections);
	private readonly navigate = dispatch(Navigate);
	private readonly useConnection = dispatch(UseConnection);
	private readonly route = inject(ActivatedRoute).snapshot;
	private readonly testDb = dispatch(TestDb);

	constructor(actions$: Actions) {
		merge(
			actions$.pipe(
				ofActionDispatched(IntrospectDb),
				map(() => true)
			),
			actions$.pipe(
				ofActionCompleted(IntrospectDb),
				map(() => false)
			)
		).pipe(
			takeUntilDestroyed(),
			startWith(false)
		).subscribe(v => this.introspectingDb.set(v));
	}

	protected onFormSubmit(form: NgForm) {
		const {
			database,
			host,
			password,
			port,
			ssl,
			username
		} = TestDbConnectionRequestSchema.parse(form.value);
		return this.testDb(host, port, database, username, password, ssl).subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('settings.advanced.msg.testing.failed'), {
					description: e.message,
					descriptionClass: 'line-clamp-4'
				});
				console.error(e);
			},
			complete: () => {
				toast.success(this.ts.instant('msg.changes_saved.title'), { description: this.ts.instant('msg.changes_saved.description') });
				const redirect = this.route.queryParams['continue'];
				form.form.controls['password'].reset();
				form.form.markAsPristine();
				form.form.markAsUntouched();
				form.form.updateValueAndValidity();
				if (!redirect) return;
				this.navigate([decodeURIComponent(redirect)]);
			}
		})
	}

	protected onFormReset(ev: Event, form: NgForm) {
		ev.preventDefault();
		untracked(this.fieldSchema).forEach(schema => {
			form.form.controls[schema.key].setValue(schema.default);
		});
		form.form.markAsPristine();
		form.form.markAsUntouched();
		form.form.updateValueAndValidity();
		this.cdr.markForCheck();
	}

	protected onApplyMigrationsButtonClicked() {
		this.applyMigrations().subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('settings.advanced.db.alerts.migrations.migration_needed.msg.migration_failed.title'))
				console.error(e);
			},
			complete: () => {
				toast.success(this.ts.instant('settings.advanced.db.alerts.migrations.migration_needed.msg.success.title'))
			}
		})
	}

	protected onUseConnectionButtonClicked(id: number) {
		this.useConnection(id);
	}

	protected onRemoveConnectionButtonClicked(id: number) {
		this.removeConnection(id);
	}

	protected onClearConnectionsButtonClicked() {
		this.clearConnections();
	}
}
