module fr.civipol.civilio {
    requires javafx.fxml;
    requires javafx.graphics;
    requires javafx.controls;
    requires spring.context;
    requires spring.core;

    opens fr.civipol.civilio.controller to javafx.fxml, spring.core;
    opens fr.civipol.civilio.beans to spring.core;
    opens fr.civipol.civilio.stage to spring.core;
    opens fr.civipol.civilio.services to spring.core;

    exports fr.civipol.civilio;
    exports fr.civipol.civilio.controller;
    exports fr.civipol.civilio.beans;
    exports fr.civipol.civilio.stage;
    exports fr.civipol.civilio.services;
}