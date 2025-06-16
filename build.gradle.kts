plugins {
    id("java")
    id("application")
    id("org.openjfx.javafxplugin") version "0.0.9"
    id("org.beryx.jlink") version "3.1.1"
    id("org.javamodularity.moduleplugin") version "1.8.15"
}

group = "fr.civipol"
version = "0.0.1"
description = "A Civil Status data management tool."

repositories {
    mavenCentral()
    mavenLocal()
    flatDir {
        dirs("libs")
    }
}

val mainClassName = "fr.civipol.civilio.Bootstrapper"
val restarterClassName = "fr.civipol.civilio.Restarter"
val javaFxVersion = "17.0.6"

application {
    mainModule.set(moduleName)
    mainClass.set(mainClassName)
    // Add the --add-exports argument here
    applicationDefaultJvmArgs = listOf(
            "-Dprism.forceGPU=true",
            "-Dprism.lcdtext=false",
            "--add-exports=javafx.base/com.sun.javafx.event=org.controlsfx.controls"
    )
}

java {
    targetCompatibility = JavaVersion.VERSION_17
    sourceCompatibility = JavaVersion.VERSION_17
}

javafx {
    version = javaFxVersion
    modules = listOf("javafx.controls", "javafx.fxml", "javafx.web")
}

val lombokVersion = "1.18.36"
val daggerVersion = "2.56"
val geoToolsVersion = "28.1"

dependencies {
    // HikariCP
    implementation("com.zaxxer:HikariCP:6.3.0")
    runtimeOnly("org.postgresql:postgresql:42.7.5")

    // ControlsFX
    implementation("org.controlsfx:controlsfx:11.2.2")

    // MinIO Client
    implementation("io.minio:minio:8.5.7")

    implementation("org.kordamp.ikonli:ikonli-javafx:12.4.0")
    implementation("org.kordamp.ikonli:ikonli-feather-pack:12.4.0")

    implementation("com.dlsc.formsfx:formsfx-core:11.6.0")

    implementation("com.dlsc.preferencesfx:preferencesfx-core:11.17.0")

    implementation("org.apache.commons:commons-lang3:3.17.0")

    implementation("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    testAnnotationProcessor("org.projectlombok:lombok:$lombokVersion")

    implementation("com.google.dagger:dagger:$daggerVersion")
    annotationProcessor("com.google.dagger:dagger-compiler:$daggerVersion")
    implementation("jakarta.inject:jakarta.inject-api:2.0.1")
    implementation("jakarta.enterprise:jakarta.enterprise.cdi-api:4.0.1")

    implementation("org.slf4j:slf4j-api:2.0.7")
    implementation("ch.qos.logback:logback-classic:1.4.12")

    testImplementation(platform("org.junit:junit-bom:5.9.1"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

jlink {
    // This is for jlink's internal module path, not for runtime of your application
    addOptions(
            "--add-modules",
            "jakarta.cdi,jakarta.inject",
            "--strip-debug",
            "--no-header-files",
            "--no-man-pages"
    )
    launcher {
        val os = org.gradle.internal.os.OperatingSystem.current();
        name = rootProject.name
        mainClass = mainClassName

        var separator = "/"
        var ext = ""
        if (os.isWindows){
            separator = "\\"
            ext = ".exe"
        }

        jvmArgs = listOf("-Djpackage.app-path=$separator${listOf("\${APP_HOME}", "..", "CivilIO$ext").joinToString(separator)}")
    }
    jpackage {
        imageName = "CivilIO"
        val os = org.gradle.internal.os.OperatingSystem.current()
        installerOptions.addAll(listOf(
                "--description", project.description.toString(),
                "--vendor", "Civipol",
                "--copyright", "Copyright 2025 Civipol",
                "--name", "CivilIO"
        ))

        when {
            os.isWindows -> {
                installerType = "msi"
                installerOptions.addAll(listOf("--win-shortcut", "--win-menu"))
            }

            os.isLinux -> {
                installerType = "deb"
            }

            os.isMacOsX -> {
                installerType = "pkg"
            }
        }
    }

    addExtraDependencies("org.slf4j")
    addExtraDependencies("ch.qos.logback")
    addExtraDependencies("resources")
    addOptions("--add-modules", "jakarta.cdi,jakarta.inject")
}

tasks.register("installerFileName") {
    doLast {
        val installerExt = when {
            System.getProperty("os.name").contains("linux", ignoreCase = true) -> "deb"
            System.getProperty("os.name").contains("windows", ignoreCase = true) -> "msi"
            else -> "pkg"
        }

        val files = fileTree(mapOf("dir" to "${layout.buildDirectory}/jpackage", "include" to "*.$installerExt"))

        println(files.first().name)
    }
}

tasks.register("installerFileContentType") {
    doLast {
        val os = org.gradle.internal.os.OperatingSystem.current();
        val installerExt = when {
            os.isLinux -> "deb"
            os.isWindows -> "msi"
            else -> "pkg"
        }

        val mimeType = "application/" + when (installerExt) {
            "deb" -> "vnd.debian.binary-package"
            "msi" -> "x-ms-installer"
            else -> "x-pkg"
        }

        println(mimeType)
    }
}

tasks.register("installerFilePath") {
    doLast {
        val installerExt = when {
            System.getProperty("os.name").contains("linux", ignoreCase = true) -> "deb"
            System.getProperty("os.name").contains("windows", ignoreCase = true) -> "msi"
            else -> "pkg"
        }

        val files = fileTree(mapOf("dir" to "${layout.buildDirectory}/jpackage", "include" to "*.$installerExt"))
        println(files.first().name)
    }
}

tasks.test {
    useJUnitPlatform()
}

val appName = System.getenv("APP_NAME") ?: "CivilIO"
val logLevel = System.getenv("LOG_LEVEL") ?: "INFO"
val appId = "${group}-${rootProject.name}"
val build = version;

tasks.processResources {
    filesMatching("logback.xml") {
        expand("logLevel" to logLevel)
    }
    filesMatching("application.properties") {
        expand(
                "appName" to appName,
                "appId" to appId,
                "build" to build,
                "projectName" to rootProject.name
        )
    }
}

tasks.compileJava {
    // This is for compilation, which is different from runtime.
    // The previous error was a runtime error.
    options.compilerArgs.addAll(listOf(
            "--add-modules", "jakarta.inject,java.naming,java.desktop"
    ))
}

tasks.named<Jar>("jar") {
    from(sourceSets.main.get().resources) {
        include("**/*.html")
        into("resources")
    }
}

//tasks.withType<JavaExec> {
//    jvmArgs = listOf("-Dprism.forceGPU=true", "-Dprism.lcdtext=false")
//}