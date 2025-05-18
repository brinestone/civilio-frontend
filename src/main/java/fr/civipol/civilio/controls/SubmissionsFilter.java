package fr.civipol.civilio.controls;

import com.dlsc.formsfx.model.structure.Form;
import com.dlsc.formsfx.model.structure.Group;
import com.dlsc.formsfx.model.util.ResourceBundleService;
import com.dlsc.formsfx.view.renderer.FormRenderer;
import fr.civipol.civilio.domain.filter.FilterManager;
import fr.civipol.civilio.entity.User;
import fr.civipol.civilio.form.field.FilterManagerField;
import javafx.beans.binding.Bindings;
import javafx.beans.property.ListProperty;
import javafx.beans.property.SimpleListProperty;
import javafx.beans.value.ObservableValue;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.StackPane;
import lombok.Getter;

import java.util.*;

public class SubmissionsFilter {
    private final ListProperty<User> users = new SimpleListProperty<>();
    private final Form filterForm;
    private Node view;
    private final ObservableValue<Integer> activeFilters;
    @Getter
    private final FilterManager filterManager = new FilterManager();

    public SubmissionsFilter(ResourceBundle resources) {
        final var ts = new ResourceBundleService(resources);
        filterForm = Form.of(
                Group.of(
                        FilterManagerField.conditionsField(resources, filterManager, this::getFilterOptions)
                                .label("filters.title")
                )
        ).i18n(ts);
        activeFilters = Bindings.size(filterManager.conditionsProperty()).asObject();
    }

    private Collection<FilterManagerField.Option> getFilterOptions(String key) {
        return Collections.emptyList();
    }

    public void reset() {
        filterManager.conditionsProperty().clear();
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
            FormRenderer content = new FormRenderer(filterForm);
            final var view = new ScrollPane(new StackPane(content));
            this.view = view;
            view.setMinWidth(640);
            view.setMinHeight(480);
            view.setFitToWidth(true);
        }
        return view;
    }
}
