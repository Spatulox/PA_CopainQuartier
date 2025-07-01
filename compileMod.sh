#!/bin/bash

# Dépendances
JSOUP_JAR="$HOME/.m2/repository/org/jsoup/jsoup/1.17.2/jsoup-1.17.2.jar"

JAVAFX_CONTROLS="$HOME/.m2/repository/org/openjfx/javafx-controls/21.0.1/javafx-controls-21.0.1-linux.jar"
JAVAFX_BASE="$HOME/.m2/repository/org/openjfx/javafx-base/21.0.1/javafx-base-21.0.1-linux.jar"
JAVAFX_GRAPHICS="$HOME/.m2/repository/org/openjfx/javafx-graphics/21.0.1/javafx-graphics-21.0.1-linux.jar"
JACKSON_CORE="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.13.0/jackson-core-2.13.0.jar"
JACKSON_DATABIND="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.13.0/jackson-databind-2.13.0.jar"


BUILD_DIR="build"
PLUGINS_DIR="plugins/mod"
mkdir -p "$BUILD_DIR" "$PLUGINS_DIR/"

# Liste des plugins à compiler et packager
PLUGINS=("ParisConcert" "ParisMusee" "ParisSpectacle" "Test")

# Fichiers communs à tous les plugins
COMMON_SOURCES=(
    "src/main/java/com/example/scraper/core/Plugin.java"
    "src/main/java/com/example/scraper/pluginutils/InternetRequest.java"
    "src/main/java/com/example/scraper/themeutils/ThemeManager.java"
    "src/main/java/com/example/scraper/core/ThemePlugin.java"
    "src/main/java/com/example/scraper/core/Database.java"
)

for PLUGIN in "${PLUGINS[@]}"; do
    echo "Compilation du plugin $PLUGIN..."
    PLUGIN_SOURCE="src/main/java/com/example/scraper/plugins/$PLUGIN.java"

    # Compilation
    javac -d "$BUILD_DIR" -cp "$JSOUP_JAR:$JAVAFX_CONTROLS:$JAVAFX_BASE:$JAVAFX_GRAPHICS:$JACKSON_CORE:$JACKSON_DATABIND" \
        "${COMMON_SOURCES[@]}" "$PLUGIN_SOURCE"

    # Crée le dossier META-INF/services pour le plugin
    mkdir -p "$BUILD_DIR/META-INF/services"
    echo "com.example.scraper.plugins.$PLUGIN" > "$BUILD_DIR/META-INF/services/com.example.scraper.core.Plugin"

    # Crée le JAR du plugin
    cd "$BUILD_DIR"
    jar cf "$PLUGIN.jar" META-INF/ com/
    mv "$PLUGIN.jar" "../$PLUGINS_DIR/"
    cd ..

    # Nettoyage temporaire pour le prochain plugin
    rm -rf "$BUILD_DIR/com" "$BUILD_DIR/META-INF"
done

echo "Les JAR des plugins (ParisConcert, ParisMusee, ParisSpectacle, Test) ont été créés dans le dossier $PLUGINS_DIR"