import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, model, OnInit, output, Signal, signal, untracked } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormSubmission, FormType, FormTypeSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideRefreshCw } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, Store } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BadgeVariants, HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { createAngularTable, createColumnHelper, FlexRender, flexRenderComponent, getCoreRowModel, getFacetedRowModel } from '@tanstack/angular-table';
import { FormService } from '../../services/form.service';
import { FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { lastFocusedFormType } from '@app/store/selectors';
import { SetFormType } from '@app/store/form';

@Component({
  selector: 'cv-badge-cell',
  imports: [HlmBadgeImports],
  template: `
    <span hlmBadge [variant]="variant()"> {{ text() }}</span>
  `
})
export class BadgeCell {
  readonly variant = input<BadgeVariants['variant']>();
  readonly text = input.required<string>();
}

@Component({
  selector: 'cv-date-cell',
  imports: [DatePipe],
  template: `
    <span>{{ text() | date:'mediumDate' }}</span>
  `
})
export class DateCell {
  readonly text = input.required<Date>();
}

type Action = {
  label?: string;
  icon?: string;
  id: string;
}

@Component({
  selector: 'cv-actions-cell',
  imports: [HlmButton, NgIcon],
  template: `
    @if((actions() ?? []).length > 0) {
      @for(action of actions(); track action.id) {
        <button (click)="actionTriggered.emit(action.id)" hlmBtn variant="ghost" [size]="!action.label && action.icon ? 'icon' : 'default'">
          @if(action.icon) {
            <ng-icon [name]="action.icon"/>
          }
          @if(action.label) {
            <span>{{ action.label}} </span>
          }
        </button>
      }
    }
  `,
  styles: `
    :host {
      @apply inline-flex justify-start items-center gap-3;
    }
  `
})
export class ButtonCell {
  readonly actions = input<Action[]>();
  readonly actionTriggered = output<string>();
}

function debounceSignal<T>(src: Signal<T>, t: number = 500) {
  return toSignal(toObservable(src).pipe(
    debounceTime(t)
  ), { initialValue: untracked(src) });
}

@Component({
  selector: 'cv-submissions',
  viewProviders: [
    provideIcons({
      lucideRefreshCw,
      lucidePencil
    })
  ],
  imports: [
    BrnSelectImports,
    FormsModule,
    NgIcon,
    HlmSelectImports,
    HlmButton,
    FlexRender,
    HlmTableImports,
    HlmInput,
    DecimalPipe
  ],
  host: {
    'class': 'page'
  },
  templateUrl: './submissions.page.html',
  styleUrl: './submissions.page.scss'
})
export class SubmissionsPage implements OnInit {
  private navigate = dispatch(Navigate);
  private route = inject(ActivatedRoute);
  private formService = inject(FormService);
  protected readonly formTypeOptions = FormTypeSchema.options
  protected readonly formType = signal<FormType>('csc');
  protected readonly pagination = signal({ pageIndex: 0, pageSize: 100 });
  protected readonly filter = model('');
  private readonly filterQuery = debounceSignal(this.filter);
  protected submissions = rxResource({
    params: () => ({ filter: this.filterQuery(), form: this.formType(), pagination: this.pagination() }),
    stream: ({ params: { form, pagination: { pageIndex, pageSize }, filter } }) => {
      // console.log(pageIndex, pageSize, filter, form);
      return this.formService.findFormSubmissions(form, pageIndex, pageSize, filter);
    }
  });
  protected readonly currentRange = computed(() => [
    this.pagination().pageIndex * this.pagination().pageSize,
    this.pagination().pageIndex * this.pagination().pageSize + Math.min(this.submissions.value()?.data.length ?? 0, this.pagination().pageSize)
  ] as [number, number]);
  protected readonly totalPages = computed(() => {
    const totalRecords = this.submissions.value()?.totalRecords;
    if (totalRecords === undefined) return 0;

    const { pageSize } = this.pagination();
    return Math.ceil(totalRecords / pageSize);
  });
  private columnHelper = createColumnHelper<FormSubmission>();
  protected readonly columnConfig = [
    {
      accessorKey: 'validationStatus',
      header: 'Validation Status',
      cell: ({ getValue }: any) => flexRenderComponent(BadgeCell, {
        inputs: {
          text: getValue() === 'validation_status_approved' ? 'Approved' : 'Unapproved',
          variant: getValue() === 'validation_status_approved' ? 'default' : 'secondary'
        }
      })
    },
    {
      accessorKey: 'index',
      header: 'Index'
    }, {
      accessorKey: 'facilityName',
      header: 'Facilility Name'
    },
    this.columnHelper.accessor('validationCode', { id: 'validationCode', header: 'Validation Code' }),
    this.columnHelper.accessor('submissionTime', {
      header: 'Submission Date',
      cell: ({ getValue }) => flexRenderComponent(DateCell, {
        inputs: {
          text: getValue()
        }
      })
    }),
    this.columnHelper.display({
      id: 'actions',
      header: () => '',
      cell: ({ row }) => {
        return flexRenderComponent(ButtonCell, {
          inputs: {
            actions: [
              { id: 'open', icon: 'lucidePencil', label: 'Modify' }
            ]
          },
          outputs: {
            actionTriggered: (value) => {
              if (value == 'open') {
                this.openSubmission(row.original.index);
              }
            },
          }
        })
      }
    })
  ];
  protected readonly table = createAngularTable(() => {
    return {
      data: this.submissions.value()?.data ?? [],
      manualPagination: true,
      rowCount: this.submissions.value()?.totalRecords ?? -1,
      columns: this.columnConfig,
      getCoreRowModel: getCoreRowModel(),
      onPaginationChange: updater => updater instanceof Function ? this.pagination.update(updater) : this.pagination.set(updater),
      initialState: {
        pagination: this.pagination(),
      }
    }
  });

  protected openSubmission(index: number) {
    this.navigate([index, this.formType()], undefined, { relativeTo: this.route });
  }

  ngOnInit(): void {
    this.formType.set(this.store.selectSnapshot(lastFocusedFormType) ?? 'csc');
  }

  constructor(private store: Store) {
    effect(() => {
      const form = this.formType();
      this.filter.set('');
      store.dispatch(new SetFormType(form));
    });
  }
}
