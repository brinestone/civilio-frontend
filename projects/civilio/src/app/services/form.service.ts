import { Injectable } from '@angular/core';
import { createPaginatedResultSchema, FieldMappingSchema, FormSubmissionSchema, FormType } from '@civilio/shared';
import { from, map } from 'rxjs';
import { sendRpcMessageAsync } from '../util';

@Injectable({
  providedIn: 'root'
})
export class FormService {
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
