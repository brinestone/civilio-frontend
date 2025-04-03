module fr.civipol.civilio {
    requires javafx.fxml;
    requires javafx.graphics;
    requires javafx.controls;
    requires lombok;
    requires org.slf4j;
    requires dagger;
    requires jakarta.inject;
    requires java.compiler;
    requires java.prefs;
    requires java.net.http;
    requires org.apache.commons.lang3;
    requires org.kordamp.ikonli.javafx;
    requires com.dlsc.preferencesfx;
    requires com.dlsc.formsfx;
    requires com.fasterxml.jackson.databind;
    requires org.hibernate.orm.core;
    requires jakarta.persistence;
    requires static java.naming;

    opens fr.civipol.civilio.controller to javafx.fxml;
    opens fr.civipol.civilio.dagger.module to dagger;
    opens fr.civipol.civilio.dagger.component to dagger;
    opens fr.civipol.civilio.dagger.factory to dagger, javafx.fxml;

    exports fr.civipol.civilio;
    exports fr.civipol.civilio.controller;
}