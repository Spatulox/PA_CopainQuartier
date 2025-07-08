#!/bin/bash

# Dépendances JavaFX et autres (ajoute ici celles nécessaires à l'app principale)
JSOUP_JAR="$HOME/.m2/repository/org/jsoup/jsoup/1.17.2/jsoup-1.17.2.jar"
JAVAFX_CONTROLS="$HOME/.m2/repository/org/openjfx/javafx-controls/21.0.1/javafx-controls-21.0.1-linux.jar"
JAVAFX_BASE="$HOME/.m2/repository/org/openjfx/javafx-base/21.0.1/javafx-base-21.0.1-linux.jar"
JAVAFX_GRAPHICS="$HOME/.m2/repository/org/openjfx/javafx-graphics/21.0.1/javafx-graphics-21.0.1-linux.jar"
JAVAFX_FXML="$HOME/.m2/repository/org/openjfx/javafx-fxml/21.0.1/javafx-fxml-21.0.1-linux.jar"
JACKSON_CORE="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.13.0/jackson-core-2.13.0.jar"
JACKSON_DATABIND="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.13.0/jackson-databind-2.13.0.jar"
JACKSON_ANNOTATION="$HOME/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.13.0/jackson-annotations-2.13.0.jar"
JSON_JAR="$HOME/.m2/repository/org/json/json/20240303/json-20240303.jar"
SLF4J_JAR="$HOME/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar"

./compileJar.sh

# Copie toutes les dépendances dans dist/ pour jpackage
cp "$JSOUP_JAR" "$JAVAFX_CONTROLS" "$JAVAFX_BASE" "$JAVAFX_GRAPHICS" "$JAVAFX_FXML" "$JACKSON_CORE" "$JACKSON_DATABIND" "$JACKSON_ANNOTATION" "$JSON_JAR" "$SLF4J_JAR" dist/

# Execute l'application, pour savoir si elle peut compiler avec jpackage
echo "---------------------------"
echo "Test manuel de lancement..."
echo "Pour sortir de l'application
      et continuer le build, veuiller
      presser CTRL + C dans la console
      et non juste fermer l'application."
MAIN_CLASS="com.example.scraper.ui.MainApp"
#java --module-path dist --add-modules javafx.controls,javafx.fxml,javafx.base,javafx.graphics -cp "dist/*" $MAIN_CLASS
echo "--------TERMINATED---------"
echo "Compiling app..."
sudo rm -r JavaApp

jpackage \
  --type app-image \
  --input dist \
  --main-jar javaapp.jar \
  --main-class com.example.scraper.ui.MainApp \
  --name JavaApp \
  --module-path "dist" \
  --add-modules javafx.controls,javafx.fxml,javafx.base,javafx.graphics
