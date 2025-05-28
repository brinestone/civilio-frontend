package fr.civipol.civilio.domain;

import fr.civipol.civilio.form.field.Option;

import java.util.Collection;
import java.util.concurrent.Future;
import java.util.function.Function;

public interface AsyncOptionSource extends Function<String, Future<Collection<Option>>> {
}
