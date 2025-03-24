module fr.civipol.civilio {
    requires javafx.fxml;
    requires javafx.graphics;
    requires javafx.controls;
    requires lombok;
    requires org.slf4j;
    requires dagger;
    requires jakarta.inject;
    requires java.compiler;

    opens fr.civipol.civilio.controller to javafx.fxml;
    opens fr.civipol.civilio.dagger to dagger;
    exports fr.civipol.civilio;
}