package fr.civipol.civilio.form.control;

import com.dlsc.formsfx.view.controls.SimpleControl;
import fr.civipol.civilio.domain.StorageHandler;
import fr.civipol.civilio.domain.UploadTask;
import fr.civipol.civilio.form.field.FilePickerField;
import javafx.beans.binding.Bindings;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.event.ActionEvent;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.stage.FileChooser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.kordamp.ikonli.javafx.FontIcon;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
public class FilePickerControl extends SimpleControl<FilePickerField> {
    private Label fileNameLabel, invalidFeedback, placeholderLabel;
    private FontIcon placeholderIcon;
    private Button pickFileButton, removeFileButton;
    private ImageView preview;
    private FileChooser fileChooser;
    private final BooleanProperty urlInvalid = new SimpleBooleanProperty(false);
    private final StorageHandler storageHandler;

    @Override
    public void setupBindings() {
        super.setupBindings();
        fileNameLabel.textProperty().bind(field.filePathProperty());
        invalidFeedback.textProperty().bind(Bindings.createStringBinding(() -> String.join("\n", field.getErrorMessages()), field.errorMessagesProperty()));
        placeholderLabel.textProperty().bind(field.placeholderTextProperty());
        pickFileButton.textProperty().bind(field.pickFileTextProperty());
        removeFileButton.textProperty().bind(field.removeFileTextProperty());
        fileChooser.titleProperty().bind(field.titleProperty());
        preview.imageProperty().bind(Bindings.createObjectBinding(() -> Optional.ofNullable(field.getValue())
                .filter(StringUtils::isNotBlank)
                .map(Image::new)
                .orElse(null), field.valueProperty()));
        urlInvalid.bind(Bindings.createBooleanBinding(() -> {
            if (StringUtils.isBlank(field.getValue()))
                return false;
            try {
                new URL(field.getValue());
                return false;
            } catch (MalformedURLException ex) {
                return true;
            }
        }, field.valueProperty()));
        removeFileButton.disableProperty().bind(field.valueProperty().isEmpty());
    }

    @Override
    public void initializeParts() {
        super.initializeParts();
        invalidFeedback.setStyle("""
                -fx-text-fill: red;
                """);
        placeholderIcon.setIconSize(40);
        fileChooser.setSelectedExtensionFilter(new FileChooser.ExtensionFilter("Photos", ".jpg", ".jpeg", ".png"));
        fileChooser.setInitialDirectory(Paths.get(System.getProperty("user.home")).toFile());
        pickFileButton.setOnAction(this::onPickFileButtonClicked);
        removeFileButton.setOnAction(this::onRemoveFileButtonClicked);
    }

    private void onRemoveFileButtonClicked(ActionEvent event) {
        storageHandler.delete(field.getValue());
        field.valueProperty().setValue(null);
    }

    private void onPickFileButtonClicked(ActionEvent event) {
        Optional.ofNullable(fileChooser.showOpenDialog(null))
                .map(storageHandler::upload)
                .ifPresent(this::processUploadProgress);
    }

    private void processUploadProgress(UploadTask s) {
        field.filePathProperty().setValue(s.getFile().getAbsolutePath());
        s.statusProperty().addListener((ob, ov, nv) -> {
            if (nv == UploadTask.TaskStatus.COMPLETED) {
                field.valueProperty().setValue(Objects.requireNonNull(s.getUrl()));
            }
        });
    }

    @Override
    public void initializeSelf() {
        super.initializeSelf();
        fileNameLabel = new Label();
        invalidFeedback = new Label();
        placeholderIcon = new FontIcon("fth-upload-cloud");
        placeholderLabel = new Label();
        pickFileButton = new Button();
        removeFileButton = new Button();
        preview = new ImageView();
        fileChooser = new FileChooser();
    }
}
