plugins {
    id("java")
    id("application")
    id("org.openjfx.javafxplugin") version "0.0.9"
//    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("org.beryx.jlink") version "3.1.1"
    id("org.javamodularity.moduleplugin") version "1.8.15"
}

group = "org.example"
version = "0.0.1"
description = "A Civil Status data management tool."

repositories {
    mavenCentral()
}

val mainClassName = "fr.civipol.civilio.Bootstrapper"
val javaFxVersion = "23.0.1"

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
    modules = listOf("javafx.controls", "javafx.fxml")
}

val springVersion = "6.1.14"
val lombokVersion = "1.18.36"

dependencies {

    implementation("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    testAnnotationProcessor("org.projectlombok:lombok:$lombokVersion")

    implementation("org.springframework:spring-context:$springVersion")
    implementation("org.springframework:spring-core:$springVersion")

    testImplementation(platform("org.junit:junit-bom:5.9.1"))
    testImplementation("org.junit.jupiter:junit-jupiter")

//    compileOnly("io.micrometer:context-propagation:1.1.2")
//    runtimeOnly("io.micrometer:context-propagation:1.1.2")
//    testCompileOnly("io.micrometer:context-propagation:1.1.2")
//    runtimeOnly("io.projectreactor.tools:blockhound:1.0.11.RELEASE")
//    testRuntimeOnly("io.projectreactor.tools:blockhound:1.0.11.RELEASE")
}

jlink {
    options = listOf(
            "--strip-debug",
            "--no-header-files",
            "--no-man-pages"
    )
    launcher {
        name = rootProject.name
        jvmArgs = listOf("-Djdk.gtk.version=2")
    }
    jpackage {
//        jvmArgs.addAll(listOf("--add-exports", "java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED"))
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
    addExtraDependencies("io.micrometer:micrometer-context:latest.release", "io.projectreactor.tools:blockhound-integration:1.0.9.RELEASE")
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
val apiUrl = System.getenv("API_URL") ?: ""

tasks.processResources {
    filesMatching("application.properties") {
        expand(
                "appName" to appName,
                "apiUrl" to apiUrl
        )
    }
}
