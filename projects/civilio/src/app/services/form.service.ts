import { Injectable } from '@angular/core';
import { createPaginatedResultSchema, FieldMappingSchema, FormSubmissionSchema, FormType, OptionSchema } from '@civilio/shared';
import { from, map } from 'rxjs';
import { sendRpcMessageAsync } from '../util';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  async loadDbColumnSpecsFor(form: FormType) {
    return await sendRpcMessageAsync('columns:read', { form });
  }
  async loadFormOptionsFor(form: FormType) {
    const result = await sendRpcMessageAsync('options:read', { form });
    return OptionSchema.array().parse(result);
  }
  async findFieldMappings(form: FormType) {
    const result = await sendRpcMessageAsync('field-mappings:read', {
      form
    });

    return FieldMappingSchema.array().parse(result);
  }
  findFormSubmissions(form: FormType, page: number, size: number, filterQuery?: string) {
    const resultSchema = createPaginatedResultSchema(FormSubmissionSchema);
    return from(sendRpcMessageAsync('submissions:read', {
      form, page, size, filter: filterQuery
    })).pipe(
      map(v => resultSchema.parse(v))
    )
  }
}
