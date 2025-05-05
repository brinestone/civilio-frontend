package fr.civipol.civilio.controller;

import java.util.function.Consumer;

public interface FormController {
    void setOnSubmit(Consumer<String> callback);
}