package fr.civipol.civilio.ui;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
public class MenuItem {
    private final String localizationKey;
    private String viewRef;
}
