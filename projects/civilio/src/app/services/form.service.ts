import { Injectable } from '@angular/core';
import { createPaginatedResultSchema, FormSubmissionSchema, FormType } from '@civilio/shared';
import { from, map } from 'rxjs';
import { sendRpcMessageAsync } from '../util';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  findFormSubmissions(form: FormType, page: number, size: number, filterQuery?: string) {
    const resultSchema = createPaginatedResultSchema(FormSubmissionSchema);
    return from(sendRpcMessageAsync('submissions:read', {
      form, page, size, filter: filterQuery
    })).pipe(
      map(v => resultSchema.parse(v))
    )
  }
}
