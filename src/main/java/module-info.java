module fr.civipol.civilio {
    requires javafx.fxml;
    requires javafx.graphics;
    requires javafx.controls;

    opens fr.civipol.civilio.controller to javafx.fxml;
    exports fr.civipol.civilio;
}