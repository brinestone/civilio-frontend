package fr.civipol.civilio.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class MenuNavigationEvent implements UIEvent {
    private final String label;
    private final String localizationKey;
    private final String viewRef;
}
