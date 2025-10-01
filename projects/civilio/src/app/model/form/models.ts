import { FieldKey, FormType, GeoPoint, GeopointSchema, Option } from '@civilio/shared';
import z from 'zod';
import { FieldDefinition, FormModelDefinition, FormModelDefinitionSchema, FormSection, RelevancePredicateSchema } from './schemas';

export const FosaFormDefinition: FormModelDefinition = FormModelDefinitionSchema.parse({
  meta: {
    form: 'fosa'
  },
  sections: [
    // #region Respondent
    {
      id: 'fosa.form.sections.respondent',
      fields: [
        {
          key: 'fosa.form.sections.respondent.fields.names',
          required: true,
          type: 'text'
        },
        {
          key: 'fosa.form.sections.respondent.fields.device',
          required: true,
          type: 'single-selection',
          optionsGroupKey: 'ju6tz85'
        },
        {
          key: 'fosa.form.sections.respondent.fields.position',
          required: true,
          type: 'text',
        },
        {
          key: 'fosa.form.sections.respondent.fields.phone',
          type: 'text'
        },
        {
          key: 'fosa.form.sections.respondent.fields.email',
          type: 'text'
        },
        {
          key: 'fosa.form.sections.respondent.fields.knows_creation_date',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.respondent.fields.creation_date',
          type: 'date',
          required: true,
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const v = deps['fosa.form.sections.respondent.fields.knows_creation_date'];
              return v === true;
            }),
            dependencies: ['fosa.form.sections.respondent.fields.knows_creation_date']
          }
        } as FieldDefinition
      ]
    },
    // #endregion
    // #region Identification
    {
      id: 'fosa.form.sections.identification',
      fields: [
        {
          key: 'fosa.form.sections.identification.fields.division',
          type: 'single-selection',
          optionsGroupKey: 'division',
          required: true,
        }, {
          key: 'fosa.form.sections.identification.fields.municipality',
          type: 'single-selection',
          optionsGroupKey: 'commune',
          required: true,
          parent: 'fosa.form.sections.identification.fields.division'
        },
        {
          key: 'fosa.form.sections.identification.fields.quarter',
          type: 'text',
          autocomplete: true,
          required: true
        },
        {
          key: 'fosa.form.sections.identification.fields.locality',
          type: 'text',
          required: true
        },
        {
          key: 'fosa.form.sections.identification.fields.facility_name',
          required: true,
          type: 'text'
        },
        {
          key: 'fosa.form.sections.identification.fields.district',
          required: true,
          type: 'single-selection',
          optionsGroupKey: 'district'
        },
        {
          key: 'fosa.form.sections.identification.fields.health_area',
          type: 'single-selection',
          optionsGroupKey: 'airesante',
        },
        {
          key: 'fosa.form.sections.identification.fields.milieu',
          // required: true,
          type: 'single-selection',
          optionsGroupKey: 'vb2qk85',
        },
        {
          key: 'fosa.form.sections.identification.fields.category',
          type: 'single-selection',
          required: true,
          optionsGroupKey: 'pa9ii12'
        },
        {
          key: 'fosa.form.sections.identification.fields.other_category',
          type: 'text',
          required: true,
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const k = 'fosa.form.sections.identification.fields.category';
              const v = Array.isArray(deps) ? deps[0] : deps;
              return v?.value === '10';
            }),
            dependencies: ['fosa.form.sections.identification.fields.category']
          }
        } as FieldDefinition,
        {
          key: 'fosa.form.sections.identification.fields.status',
          type: 'single-selection',
          optionsGroupKey: 'qy7we33',
          required: true
        },
        {
          key: 'fosa.form.sections.identification.fields.has_maternity',
          type: 'boolean',
        },
        {
          key: 'fosa.form.sections.identification.fields.attached_cs',
          type: 'text',
          required: true
        },
        {
          key: 'fosa.form.sections.identification.fields.cs_proximity',
          type: 'int',
          min: 0,
          max: 80000
        },
        {
          key: 'fosa.form.sections.identification.fields.knows_gps_coords',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.identification.fields.gps_coords',
          type: 'point',
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const v = deps['fosa.form.sections.identification.fields.knows_gps_coords'];
              return v === true;
            }),
            dependencies: ['fosa.form.sections.identification.fields.knows_gps_coords']
          }
        },
      ]
    },
    // #endregion
    {
      id: 'fosa.form.sections.reg_cs_events',
      fields: [
        {
          key: 'fosa.form.sections.reg_cs_events.fields.dhis2_usage',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.reg_cs_events.fields.uses_bunec_birth_form',
          type: 'boolean',
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const v = deps['fosa.form.sections.reg_cs_events.fields.dhis2_usage'];
              return v === true;
            }),
            dependencies: ['fosa.form.sections.reg_cs_events.fields.dhis2_usage']
          }
        },
        {
          key: 'fosa.form.sections.reg_cs_events.fields.dhis2_form_training',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.reg_cs_events.fields.birth_declaration_transmission_to_csc',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.reg_cs_events.fields.csc_event_reg_type',
          type: 'multi-selection',
          optionsGroupKey: 'ij2ql10',
          required: true
        },
      ]
    },
    {
      id: 'fosa.form.sections.stats',
      fields: [],
      children: [
        {
          id: 'fosa.form.sections.stats.line_1',
          fields: [
            { key: 'fosa.form.sections.stats.line_1.fields.stats_year_1', type: 'int' },
            { key: 'fosa.form.sections.stats.line_1.fields.stats_births_1', type: 'int' },
            { key: 'fosa.form.sections.stats.line_1.fields.stats_deaths_1', type: 'int' },
          ]
        },
        {
          id: 'fosa.form.sections.stats.line_2',
          fields: [
            { key: 'fosa.form.sections.stats.line_2.fields.stats_year_2', type: 'int' },
            { key: 'fosa.form.sections.stats.line_2.fields.stats_births_2', type: 'int' },
            { key: 'fosa.form.sections.stats.line_2.fields.stats_deaths_2', type: 'int' },
          ]
        }, {
          id: 'fosa.form.sections.stats.line_3',
          fields: [
            { key: 'fosa.form.sections.stats.line_3.fields.stats_year_3', type: 'int' },
            { key: 'fosa.form.sections.stats.line_3.fields.stats_births_3', type: 'int' },
            { key: 'fosa.form.sections.stats.line_3.fields.stats_deaths_3', type: 'int' },
          ]
        },
        {
          id: 'fosa.form.sections.stats.line_4',
          fields: [
            { key: 'fosa.form.sections.stats.line_4.fields.stats_year_4', type: 'int' },
            { key: 'fosa.form.sections.stats.line_4.fields.stats_births_4', type: 'int' },
            { key: 'fosa.form.sections.stats.line_4.fields.stats_deaths_4', type: 'int' },
          ]
        },
        {
          id: 'fosa.form.sections.stats.line_5',
          fields: [
            { key: 'fosa.form.sections.stats.line_5.fields.stats_year_5', type: 'int' },
            { key: 'fosa.form.sections.stats.line_5.fields.stats_births_5', type: 'int' },
            { key: 'fosa.form.sections.stats.line_5.fields.stats_deaths_5', type: 'int' },
          ]
        }
      ]
    },
    {
      id: 'fosa.form.sections.infra',
      children: [
        {
          id: 'fosa.form.sections.infra.sections.eq',
          fields: [
            { required: true, min: 0, max: 1000, key: 'fosa.form.sections.infra.sections.eq.fields.pc_count', type: 'int' },
            { required: true, min: 0, max: 1000, key: 'fosa.form.sections.infra.sections.eq.fields.printer_count', type: 'int' },
            { required: true, min: 0, max: 1000, key: 'fosa.form.sections.infra.sections.eq.fields.tablet_count', type: 'int' },
            { required: true, min: 0, max: 100, key: 'fosa.form.sections.infra.sections.eq.fields.car_count', type: 'int' },
            { required: true, min: 0, max: 100, key: 'fosa.form.sections.infra.sections.eq.fields.bike_count', type: 'int' },
          ]
        }
      ],
      fields: [
        {
          key: 'fosa.form.sections.infra.fields.toilet_present',
          type: 'boolean',
        },
        { key: 'fosa.form.sections.infra.fields.eneo_connection', type: 'boolean' },
        { key: 'fosa.form.sections.infra.fields.backup_power_available', type: 'boolean' },
        {
          key: 'fosa.form.sections.infra.fields.backup_power',
          type: 'multi-selection',
          required: true,
          optionsGroupKey: 'xt53f30',
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const v = deps['fosa.form.sections.infra.fields.backup_power_available'];
              return v === true;
            }),
            dependencies: ['fosa.form.sections.infra.fields.backup_power_available']
          }
        },
        {
          key: 'fosa.form.sections.infra.fields.has_internet',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.infra.fields.water_source_available',
          type: 'boolean'
        },
        {
          key: 'fosa.form.sections.infra.fields.water_sources',
          type: 'multi-selection',
          optionsGroupKey: 'zp4ec39',
          relevance: {
            predicate: RelevancePredicateSchema.implement((deps) => {
              const v = deps['fosa.form.sections.infra.fields.water_source_available'];
              return v === true;
            }),
            dependencies: ['fosa.form.sections.infra.fields.water_source_available']
          },
          required: true
        }
      ]
    },
    {
      id: 'fosa.form.sections.staff',
      fields: [
        {
          key: 'fosa.form.sections.staff.fields.employee_count',
          type: 'int',
          required: true,
          min: 0,
          max: 500
        }
      ],
      children: [
        {
          id: 'fosa.form.sections.staff.sections.employees',
          fields: [
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.names',
              type: 'text',
              required: true
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.position',
              type: 'text',
              required: true
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.gender',
              type: 'single-selection',
              required: true,
              optionsGroupKey: 'xw39g10'
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.phone',
              type: 'text',
              pattern: '^(((\\+?237)?([62][0-9]{8}))(((, ?)|( ?/ ?))(\\+?237)?([62][0-9]{8}))*)$',
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.age',
              required: true,
              type: 'int',
              min: 18,
              max: 90
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.has_cs_training',
              type: 'boolean'
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.ed_level',
              type: 'single-selection',
              optionsGroupKey: 'ta2og93',
              required: true
            },
            {
              key: 'fosa.form.sections.staff.sections.employees.fields.computer_level',
              type: 'single-selection',
              required: true,
              optionsGroupKey: 'nz2pr56'
            }
          ]
        }
      ]
    },
    {
      id: 'fosa.form.sections.extras',
      fields: [
        {
          key: 'fosa.form.sections.extras.fields.relevant_info',
          type: 'text',
          multiline: true,
        },
        {
          key: 'fosa.form.fields.validation_code',
          required: true,
          type: 'text',
          validValues: [
            'MOM01',
            'ANG02',
            'HAM03',
            'JOU04',
            'DJA05',
            'OUN06',
            'GTE07',
            'AIN08',
            'HAM09',
            'ANG10',
            'BAN11',
            'BOT12',
            'LIM13',
            'KEM14',
            'AMA15',
            'UEN16',
            'GAM17',
            'UDA18',
            'IFI19',
            'HEL20',
            'HOU21'
          ]
        },
      ]
    }
  ],
});

export const ChefferieFormDefinition = FormModelDefinitionSchema.parse({
  sections: [],
  meta: {
    form: 'chefferie' as FormType
  }
});

export const CscFormDefinition = FormModelDefinitionSchema.parse({
  sections: [],
  meta: {
    form: 'csc' as FormType
  }
})

function extractFields(section: FormSection) {
  const lookupMap: any = {};
  if (section.children && section.children.length > 0) {
    section.children.forEach(child => {
      const extract = extractFields(child);
      Object.assign(lookupMap, extract);
    });
  }
  for (const field of section.fields) {
    lookupMap[field.key] = field;
  }

  return lookupMap as Record<FieldKey, FieldDefinition>;
};

const lookupCache: Record<FormType, Record<FieldKey, FieldDefinition> | undefined> = {
  chefferie: undefined,
  csc: undefined,
  fosa: undefined
};

export function extractAllFields(model: FormModelDefinition) {
  const list = Array<FieldDefinition>();

  for (const section of model.sections) {
    list.push(...listFieldsInSection(section));
  }

  return list;
}

function listFieldsInSection(section: FormSection) {
  const result = [...section.fields];
  if (section.children) {
    for (const child of section.children) {
      result.push(...listFieldsInSection(child));
    }
  }
  return result;
}

export function lookupFieldSchema(formDefinition: FormModelDefinition, key: FieldKey) {
  let schema = lookupCache[formDefinition.meta.form];
  if (schema) return schema[key];

  for (const section of formDefinition.sections) {
    const entry = lookupCache[formDefinition.meta.form];
    lookupCache[formDefinition.meta.form] = Object.assign(entry ?? {}, extractFields(section));
  }
  return lookupFieldSchema(formDefinition, key);
}

export function defaultValueForType(type: FieldDefinition['type']) {
  switch (type) {
    case 'boolean': return false;
    case 'date': return new Date();
    case 'float':
    case 'int': return 0.0;
    case 'multi-selection': return Array<Option>()
    case 'point': return GeopointSchema.parse({})
    case 'text': return '';
    default: return null;
  }
}

export type ParsedValue = boolean | null | Date | GeoPoint | number | string;
export type RawInput = (string | null)[] | string;
export function parseValue(definition: FieldDefinition, raw: RawInput | null): ParsedValue | ParsedValue[] {
  if (Array.isArray(raw)) return raw.flatMap(v => parseValue(definition, v));
  switch (definition.type) {
    case 'boolean': {
      try {
        const result = z.union(
          [
            z.literal('1').transform(() => true),
            z.literal('2').transform(() => false),
            z.null().transform(() => false)
          ]).parse(raw);
        return result;
      } catch (e) {
        return false;
      }
    }
    case 'date': return z.union([
      z.iso.date().pipe(z.coerce.date()),
      z.date().nullable().default(new Date())
    ]).parse(raw);
    case 'float':
    case 'int': return z.coerce.number().nullable().parse(raw)
    case 'multi-selection': return raw?.split(' ') ?? []
    case "point": {
      if (!raw) return GeopointSchema.parse({});
      if (typeof raw == 'string') {
        const [lat, long] = raw?.split(' ', 2) ?? [];
        return GeopointSchema.parse({ lat, long });
      }
      return raw;
    }
    case 'text': {
      if (!raw) return defaultValueForType('text') as string;
      return String(raw);
    }
    case 'single-selection': return raw;
    default: return null;
  }
}
