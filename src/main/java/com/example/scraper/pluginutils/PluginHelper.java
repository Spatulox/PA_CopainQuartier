package com.example.scraper.pluginutils;

import javafx.scene.control.Alert;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class PluginHelper {

    public static void showPluginForm(Stage stage) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Choisir un plugin (JAR)");
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Fichiers JAR", "*.jar")
        );

        File selectedFile = fileChooser.showOpenDialog(stage);
        if (selectedFile != null) {
            try {
                File pluginsDir = new File("plugins");
                if (!pluginsDir.exists()) pluginsDir.mkdir();

                File target = new File(pluginsDir, selectedFile.getName());
                Files.copy(selectedFile.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);

                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Succès");
                alert.setHeaderText("Plugin ajouté !");
                alert.setContentText("Le plugin a été copié dans le dossier /plugins.");
                alert.showAndWait();
            } catch (IOException ex) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Erreur");
                alert.setHeaderText("Échec de l'ajout du plugin");
                alert.setContentText("Erreur : " + ex.getMessage());
                alert.showAndWait();
            }
        }
    }
}
