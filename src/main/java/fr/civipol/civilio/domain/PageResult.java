package fr.civipol.civilio.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.Collections;

@Getter
@RequiredArgsConstructor
@Builder
public class PageResult<T> {
    @Builder.Default
    private final Collection<T> data = Collections.emptyList();
    @Builder.Default
    private final Long totalRecords = 0L;
}
