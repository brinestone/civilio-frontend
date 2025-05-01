package fr.civipol.civilio.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class NavigateEvent implements Event {
    private final String viewRef;
}
