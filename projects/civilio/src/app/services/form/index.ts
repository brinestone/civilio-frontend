import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { isDesktop } from "@app/util";
import { ElectronFormService } from "../electron/form.service";
import { WebFormService } from "../web/form.service";
import { FormType, FindSubmissionDataResponse, FieldUpdateSpec, FindFieldMappingsResponse, FindDbColumnsResponse, FindFormOptionsResponse, Paginated, FormSubmissionSchema } from "@civilio/shared";

export interface FormService {
  findSubmissionData(form: FormType, index: number): Promise<FindSubmissionDataResponse>;
  updateFieldMappings(form: FormType, ...mappings: FieldUpdateSpec[]): Promise<FindFieldMappingsResponse>;
  loadDbColumnSpecsFor(form: FormType): Promise<FindDbColumnsResponse>;
  loadFormOptionsFor(form: FormType): Promise<FindFormOptionsResponse>;
  findFieldMappings(form: FormType): Promise<FindFieldMappingsResponse>;
  findFormSubmissions(form: FormType, page: number, size: number, filter?: string): Promise<Paginated<typeof FormSubmissionSchema>>;
}

export const FORM_SERVICE = new InjectionToken<FormService>('Form Service');

export function provideDomainForms() {
  const providers: any = [
    {
      provide: FORM_SERVICE, useExisting: isDesktop() ? ElectronFormService : WebFormService
    }
  ];
  if (isDesktop()) {
    providers.push({ provide: ElectronFormService, useClass: ElectronFormService });
  } else {
    providers.push({ provide: WebFormService, useClass: WebFormService });
  }
  return makeEnvironmentProviders(providers);
}
