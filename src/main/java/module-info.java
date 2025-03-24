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
    exports fr.civipol.civilio;
    opens fr.civipol.civilio.dagger.module to dagger;
    opens fr.civipol.civilio.dagger.component to dagger;
    opens fr.civipol.civilio.dagger.factory to dagger, javafx.fxml;
}