package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.DataField;
import com.dlsc.formsfx.model.util.TranslationService;
import fr.civipol.civilio.domain.StorageHandler;
import fr.civipol.civilio.form.control.PhotoPickerControl;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import org.apache.commons.lang3.StringUtils;

import java.util.Optional;

public class PhotoField extends DataField<StringProperty, String, PhotoField> {
    private static final String PLACEHOLDER_LABEL_KEY = "controls.file_picker.placeholder.txt";
    private static final String PICK_FILE_LABEL_KEY = "controls.file_picker.actions.pick_file.txt";
    private static final String REMOVE_FILE_LABEL_KEY = "controls.file_picker.actions.remove_file.txt";
    private static final String PICKER_TITLE_LABEL_KEY = "controls.file_picker.title.txt";
    protected final StringProperty placeholderText = new SimpleStringProperty(PLACEHOLDER_LABEL_KEY);
    protected final StringProperty pickFileText = new SimpleStringProperty(PICK_FILE_LABEL_KEY);
    protected final StringProperty removeFileText = new SimpleStringProperty(REMOVE_FILE_LABEL_KEY);
    protected final StringProperty filePath = new SimpleStringProperty();
    protected final StringProperty title = new SimpleStringProperty(PICKER_TITLE_LABEL_KEY);

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        placeholderText.setValue(service.translate(PLACEHOLDER_LABEL_KEY));
        pickFileText.setValue(service.translate(PICK_FILE_LABEL_KEY));
        title.setValue(service.translate(PICKER_TITLE_LABEL_KEY));
        removeFileText.setValue(service.translate(REMOVE_FILE_LABEL_KEY));
    }

    protected PhotoField(SimpleStringProperty valueProperty, SimpleStringProperty persistentValueProperty, StorageHandler storageHandler) {
        super(valueProperty, persistentValueProperty);
        rendererSupplier = () -> new PhotoPickerControl(storageHandler);
    }

    public PhotoField placeholderText(String placeholderText) {
        this.placeholderText.set(
                Optional.ofNullable(placeholderText)
                        .filter(StringUtils::isNotBlank)
                        .orElse(PLACEHOLDER_LABEL_KEY)
        );
        return this;
    }

    public PhotoField filePath(String filePath) {
        this.filePath.set(filePath);
        return this;
    }

    public PhotoField title(String title) {
        this.title.set(title);
        return this;
    }

    public StringProperty placeholderTextProperty() {
        return placeholderText;
    }

    public StringProperty filePathProperty() {
        return filePath;
    }

    public StringProperty pickFileTextProperty() {
        return pickFileText;
    }

    public StringProperty removeFileTextProperty() {
        return removeFileText;
    }

    public StringProperty titleProperty() {
        return title;
    }

    public static PhotoField create(StringProperty binding, StorageHandler storageHandler) {
        return new PhotoField(new SimpleStringProperty(binding.getValue()), new SimpleStringProperty(binding.getValue()), storageHandler).bind(binding);
    }
}
