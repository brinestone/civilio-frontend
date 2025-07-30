package fr.civipol.civilio.form.field;

import com.dlsc.formsfx.model.structure.StringField;
import com.dlsc.formsfx.model.util.TranslationService;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class PhotoField extends StringField {
    protected final StringProperty placeholderText = new SimpleStringProperty("controls.file_picker.placeholder.txt");
    protected final StringProperty pickFileText = new SimpleStringProperty("controls.file_picker.actions.pick_file.txt");
    protected final StringProperty removeFileText = new SimpleStringProperty("controls.file_picker.actions.remove_file.txt");
    protected final StringProperty filePath = new SimpleStringProperty();
    protected final StringProperty title = new SimpleStringProperty("controls.file_picker.title.txt");

    @Override
    public void translate(TranslationService service) {
        super.translate(service);
        service.translate(placeholderText.getValueSafe());
        service.translate(pickFileText.getValueSafe());
        service.translate(title.getValueSafe());
        service.translate(removeFileText.getValueSafe());
    }

    protected PhotoField(SimpleStringProperty valueProperty, SimpleStringProperty persistentValueProperty) {
        super(valueProperty, persistentValueProperty);
    }

    public static PhotoField create(StringProperty valueProperty) {
        return new PhotoField(new SimpleStringProperty(valueProperty.get()), new SimpleStringProperty(valueProperty.get()));
    }

    public PhotoField placeholderText(String placeholderText) {
        this.placeholderText.set(placeholderText);
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
}
