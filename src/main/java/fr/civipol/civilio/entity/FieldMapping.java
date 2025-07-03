package fr.civipol.civilio.entity;

public record FieldMapping(
        String field,
        String i18nKey,
        String dbColumn,
        String dbTable,
        String type,
        Integer ordinal
) {
}
