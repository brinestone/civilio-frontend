package fr.civipol.civilio.domain;

import javafx.beans.binding.Bindings;
import javafx.beans.property.*;
import lombok.Getter;

import java.io.File;

public class UploadTask {
    public enum TaskStatus {
        COMPLETED,
        FAILED,
        IN_PROGRESS,
        PENDING
    }

    @Getter
    private Throwable failureReason;
    private final SimpleStringProperty url = new SimpleStringProperty();
    private final FloatProperty progress = new SimpleFloatProperty(-1f);
    private final ReadOnlyObjectWrapper<TaskStatus> status = new ReadOnlyObjectWrapper<>(TaskStatus.PENDING);
    @Getter
    private final File file;

    public UploadTask(File file) {
        this.file = file;
        status.bind(Bindings.when(
                                Bindings.and(
                                        Bindings.greaterThanOrEqual(progress, 0),
                                        Bindings.lessThan(progress, 1)
                                )
                        ).then(TaskStatus.IN_PROGRESS)
                        .otherwise(Bindings.when(
                                                progress.greaterThanOrEqualTo(1.0f)
                                        ).then(TaskStatus.COMPLETED)
                                        .otherwise(TaskStatus.PENDING)
                        )
        );
    }

    public void fail(Throwable t) {
        failureReason = t;
        status.unbind();
        status.set(TaskStatus.FAILED);
        setProgress(-1f);
    }

    public void setProgress(float value) {
        progress.set(value);
    }

    public ReadOnlyObjectProperty<TaskStatus> statusProperty() {
        return status.getReadOnlyProperty();
    }

    public TaskStatus getStatus() {
        return status.get();
    }

    public String getUrl() {
        return url.get();
    }

    public SimpleStringProperty urlProperty() {
        return url;
    }

    public void setUrl(String url) {
        this.url.set(url);
    }

}
