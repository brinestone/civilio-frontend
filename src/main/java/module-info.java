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
    requires jakarta.cdi;
    requires com.fasterxml.jackson.databind;
    requires minio;
    requires com.google.common;
    requires org.controlsfx.controls;

    opens fr.civipol.civilio.dagger.module to dagger;
    opens fr.civipol.civilio.dagger.component to dagger;
    opens fr.civipol.civilio.dagger.factory to dagger, javafx.fxml;
    opens fr.civipol.civilio.controller.csc to javafx.fxml;
    opens fr.civipol.civilio.controls to javafx.fxml;
    opens fr.civipol.civilio.controller to javafx.fxml;
    opens fr.civipol.civilio.controller.fosa to javafx.fxml;

    exports fr.civipol.civilio.controls;
    exports fr.civipol.civilio;
    exports fr.civipol.civilio.controller;
    exports fr.civipol.civilio.exception;
    exports fr.civipol.civilio.entity;
    exports fr.civipol.civilio.event;
    exports fr.civipol.civilio.stage;
    exports fr.civipol.civilio.controller.fosa;
    exports fr.civipol.civilio.ui;
    exports fr.civipol.civilio.domain;
    opens fr.civipol.civilio.domain to javafx.fxml;
    exports fr.civipol.civilio.forms.field;
    opens fr.civipol.civilio.forms.field to javafx.fxml;
    exports fr.civipol.civilio.forms.controls;
    opens fr.civipol.civilio.forms.controls to javafx.fxml;
}