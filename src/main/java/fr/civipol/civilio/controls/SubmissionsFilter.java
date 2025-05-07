package fr.civipol.civilio.controls;

import com.dlsc.formsfx.model.structure.Field;
import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import com.dlsc.formsfx.view.util.ColSpan;
import fr.civipol.civilio.entity.User;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.value.ObservableValue;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;

import java.util.*;

public class SubmissionsFilter {
    private static final String VS_VALID_ONLY = "filters.validation.valid";
    private static final String VS_INVALID_ONLY = "filters.validation.invalid";
    private static final String VS_ANY = "filters.validation.any";
    private static final List<User> DEFAULT_USERS = Collections.emptyList();
    private final ListProperty<User> users = new SimpleListProperty<>();
    private final ListProperty<User> selectedUsers = new SimpleListProperty<>();
    private final Form filterForm;
    private Node view;
    private final ObservableValue<Integer> activeFilters;

    public SubmissionsFilter(ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        filterForm = Form.of(
                Group.of(
                        Field.ofMultiSelectionType(DEFAULT_USERS)
                                .label("filters.user.recorded_by.title")
                                .bind(users, selectedUsers),
                        Field.ofSingleSelectionType(List.of(resources.getString(VS_ANY), resources.getString(VS_VALID_ONLY), resources.getString(VS_INVALID_ONLY)), 0)
                                .label("filters.validation.title")
                                .span(ColSpan.HALF)
                )
        ).i18n(ts);
        activeFilters = Bindings.createIntegerBinding(() -> Long.valueOf(filterForm.getFields().stream()
                .filter(Field::hasChanged)
                .count()).intValue(), filterForm.changedProperty()).asObject();
    }

    public void reset() {
        // TODO: reset all filters to default values.
    }

    public Integer getActiveFilters() {
        return activeFilters.getValue();
    }

    public ObservableValue<Integer> activeFiltersProperty() {
        return activeFilters;
    }

    public void setUsers(Collection<User> users) {
        Optional.ofNullable(users)
                .ifPresentOrElse(this.users::setAll, this.users::clear);
    }

    public Node getView() {
        if (view == null) {
            final var view = new ScrollPane(new FormRenderer(filterForm));
            this.view = view;
            view.setPrefHeight(400);
            view.setFitToWidth(true);
        }
        return view;
    }
}
