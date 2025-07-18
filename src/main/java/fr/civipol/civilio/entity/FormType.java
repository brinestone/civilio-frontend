package fr.civipol.civilio.entity;

public enum FormType {
    FOSA("fosa"),
    CHIEFDOM("chefferie"),
    CSC("csc");

    private final String formName;

    FormType(String formName) {
        this.formName = formName;
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
