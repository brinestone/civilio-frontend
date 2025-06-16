package fr.civipol.civilio;

import javafx.application.Platform;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class Restarter {
    private static boolean isJPackageBundle() {
        return StringUtils.isNotBlank(System.getProperty("jpackage.app-path"));
    }

    public static void restartApplication() {
        if (isJPackageBundle()) {
            restartFromJPackageBundle();
        } else {
            restartFromDevelopmentEnvironment();
        }
    }

    private static void restartFromJPackageBundle() {
        try {
            final var appPath = System.getProperty("jpackage.app-path");
            if (!StringUtils.isNotBlank(appPath)) {
                throw new IllegalStateException("Not running from jpackage bundle");
            }

            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                new ProcessBuilder(appPath).start();
            } else if (System.getProperty("os.name").toLowerCase().contains("mac")) {
                new ProcessBuilder("open", appPath).start();
            } else {
                new ProcessBuilder(appPath).start();
            }

            Platform.exit();
        } catch (IOException ex) {
            log.error("error while re-starting application");
        }
    }

    private static void restartFromDevelopmentEnvironment() {
        try {
            final var javaPath = Paths.get(System.getProperty("java.home"), "bin", "java").toString();
            final var command = new ArrayList<>();
            command.add(javaPath);

            if (System.getProperty("jdk.module.path") != null) {
                command.add("--module-path");
                command.add(System.getProperty("jdk.module.path"));
                command.add("--module");
                command.add("fr.civipol.civilio/fr.civipol.civilio.Bootstrapper");
            } else {
                command.add("-cp");
                command.add(System.getProperty("java.class.path"));
                command.add("fr.civipol.civilio.Bootstrapper");
            }

            new ProcessBuilder(command.toArray(String[]::new))
                    .inheritIO()
                    .start();

            System.exit(0);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
