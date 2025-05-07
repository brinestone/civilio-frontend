package fr.civipol.civilio.services;

import fr.civipol.civilio.domain.PageResult;
import fr.civipol.civilio.domain.QueryFilter;
import fr.civipol.civilio.entity.FormSubmission;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FormService implements AppService {
    @Inject
    public FormService() {
    }

    public void deleteSubmissions(String... ids) {
        // TODO: Delete from datasource the provided IDs.
    }

    public PageResult<FormSubmission> findFormSubmissions(int page, int size, QueryFilter<?>... filters) {
        return PageResult.<FormSubmission>builder().build();
    }

    public PageResult<FormSubmission> findFormSubmissions(int size) {
        return findFormSubmissions(0, size);
    }
}
