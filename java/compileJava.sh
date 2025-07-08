#!/bin/bash

# Dépendances JavaFX et autres (ajoute ici celles nécessaires à l'app principale)
JSOUP_JAR="$HOME/.m2/repository/org/jsoup/jsoup/1.17.2/jsoup-1.17.2.jar"
JAVAFX_CONTROLS="$HOME/.m2/repository/org/openjfx/javafx-controls/21.0.1/javafx-controls-21.0.1-linux.jar"
JAVAFX_BASE="$HOME/.m2/repository/org/openjfx/javafx-base/21.0.1/javafx-base-21.0.1-linux.jar"
JAVAFX_GRAPHICS="$HOME/.m2/repository/org/openjfx/javafx-graphics/21.0.1/javafx-graphics-21.0.1-linux.jar"
JAVAFX_FXML="$HOME/.m2/repository/org/openjfx/javafx-fxml/21.0.1/javafx-fxml-21.0.1-linux.jar"
JACKSON_CORE="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.13.0/jackson-core-2.13.0.jar"
JACKSON_DATABIND="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.13.0/jackson-databind-2.13.0.jar"
JSON_JAR="$HOME/.m2/repository/org/json/json/20240303/json-20240303.jar"
SLF4J_JAR="$HOME/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar"

BUILD_DIR="build_main"
JAR_NAME="webscrapper.jar"
MAIN_CLASS="com.example.scraper.ui.MainApp"


export JAVA_HOME="$HOME/.jdks/ms-21.0.7"
export PATH="$JAVA_HOME/bin:$PATH"

mkdir -p "$BUILD_DIR"

# Compilation de toutes les sources principales
find src/main/java -name "*.java" > sources.txt
javac -d "$BUILD_DIR" -cp "$JSOUP_JAR:$JAVAFX_CONTROLS:$JAVAFX_BASE:$JAVAFX_GRAPHICS:$JACKSON_CORE:$JACKSON_DATABIND:$JSON_JAR:$SLF4J_JAR" @sources.txt

# Création du manifest pour indiquer la classe principale
echo "Main-Class: $MAIN_CLASS" > "$BUILD_DIR/manifest.txt"

# Création du JAR exécutable
cd "$BUILD_DIR"
jar cfm "../dist/$JAR_NAME" manifest.txt com/
cd ..

# Nettoyage
rm -rf "$BUILD_DIR" sources.txt

#echo "Le JAR exécutable $JAR_NAME a été créé à la racine du projet."

# Copie toutes les dépendances dans dist/
cp "$JSOUP_JAR" "$JAVAFX_CONTROLS" "$JAVAFX_BASE" "$JAVAFX_GRAPHICS" "$JAVAFX_FXML" "$JACKSON_CORE" "$JACKSON_DATABIND" "$JSON_JAR" "$SLF4J_JAR" dist/

echo "---------------------------"
echo "Test manuel de lancement..."
echo "Pour sortir de l'application
      et continuer le build, veuiller
      presser CTRL + C dans la console
      et non juste fermer l'application."
java --module-path dist --add-modules javafx.controls,javafx.fxml,javafx.base,javafx.graphics -cp "dist/*" $MAIN_CLASS
echo "--------TERMINATED---------"

sudo rm -r WebScrapper

jpackage \
  --type app-image \
  --input dist \
  --main-jar webscrapper.jar \
  --main-class com.example.scraper.ui.MainApp \
  --name WebScrapper \
  --module-path "dist" \
  --add-modules javafx.controls,javafx.fxml,javafx.base,javafx.graphics
