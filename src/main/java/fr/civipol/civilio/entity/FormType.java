package fr.civipol.civilio.entity;

import lombok.Getter;

public enum FormType {
    FOSA("fosa", "data_fosa"),
    CHIEFDOM("chefferie", "data_chefferie"),
    CEC("csc", "data_cec");

    private final String formName;
    @Getter
    private final String dbTable;

    FormType(String formName, String dbTable) {
        this.formName = formName;
        this.dbTable = dbTable;
    }

    @Override
    public String toString() {
        return this.formName;
    }

    public static FormType fromString(String string) {
        for (var formType : FormType.values())
            if (string.equalsIgnoreCase(formType.formName) || formType.name().equalsIgnoreCase(string))
                return formType;
        throw new IllegalArgumentException("No constant with text " + string + "found");
    }
}
