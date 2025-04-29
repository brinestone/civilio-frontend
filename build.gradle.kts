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
val javaFxVersion = "17.0.6"

application {
    mainModule.set(moduleName)
    mainClass.set(mainClassName)
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
val hibernateVersion = "6.6.12.Final"
val geoToolsVersion = "28.1"

dependencies {
    // GMapsFX
    implementation("com.dlsc:GMapsFX:11.0.7")

    // ControlsFX
    implementation("org.controlsfx:controlsfx:11.2.2")

    // MinIO Client
    implementation("io.minio:minio:8.5.7")

//    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")

    implementation("org.kordamp.ikonli:ikonli-javafx:12.3.1")

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
    options = listOf(
            "--add-modules",
            "jakarta.cdi,jakarta.inject,jakarta.activation,jakarta.mail",
            "--strip-debug",
            "--no-header-files",
            "--no-man-pages"
    )
    launcher {
        name = rootProject.name
        jvmArgs = listOf("-Djdk.gtk.version=2")
    }
    jpackage {
        if (System.getProperty("os.name").lowercase().contains("linux")) {
            targetPlatformName = "linux"
            installerType = "deb"
        } else if (System.getProperty("os.name").lowercase().contains("windows")) {
            targetPlatformName = "win"
            installerType = "msi"
            installerOptions.addAll(listOf(
                    "--win-shortcut",
                    "--win-menu"
            ))
        } else {
            targetPlatformName = "darwin"
            installerType = "pkg"
        }
        targetPlatform(targetPlatformName, System.getenv("JAVA_HOME"))
        installerOptions.addAll(listOf(
                "--description", project.description,
                "--vendor", "Civipol",
                "--copyright", "Copyright 2025 Civipol"
        ))
        imageOptions = listOf("--icon", "src/main/resources/img/Logo32x32.ico")
    }
    addExtraDependencies("org.slf4j")
    addExtraDependencies("ch.qos.logback")
    addExtraDependencies("postgresql")
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
        val installerExt = when {
            System.getProperty("os.name").contains("linux", ignoreCase = true) -> "deb"
            System.getProperty("os.name").contains("windows", ignoreCase = true) -> "msi"
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

val appName = System.getenv("APP_NAME") ?: name
val logLevel = System.getenv("LOG_LEVEL") ?: "INFO"
val appId = "${group}-${rootProject.name}"

tasks.processResources {
    filesMatching("logback.xml") {
        expand("logLevel" to logLevel)
    }
    filesMatching("application.properties") {
        expand(
                "appName" to appName,
                "appId" to appId,
        )
    }
}

tasks.compileJava {
    options.compilerArgs.addAll(listOf(
            "--add-modules", "jakarta.inject,java.naming,java.desktop"
    ))
}