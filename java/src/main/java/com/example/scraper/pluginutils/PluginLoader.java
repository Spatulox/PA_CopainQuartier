package com.example.scraper.pluginutils;

import com.example.scraper.core.AppFilesPath;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class PluginLoader {

    public static void showPluginForm(Stage stage) {
        Alert choiceDialog = new Alert(Alert.AlertType.CONFIRMATION);
        choiceDialog.setTitle("Type de plugin");
        choiceDialog.setHeaderText("Que souhaitez-vous ajouter ?");
        choiceDialog.setContentText("Choisissez le type de plugin à ajouter :");

        ButtonType themeButton = new ButtonType("Thème");
        ButtonType modButton = new ButtonType("Mod");
        ButtonType cancelButton = new ButtonType("Annuler", ButtonBar.ButtonData.CANCEL_CLOSE);

        choiceDialog.getButtonTypes().setAll(themeButton, modButton, cancelButton);
        
        choiceDialog.showAndWait().ifPresent(buttonType -> {
            if (buttonType == themeButton) {
                copyPluginFile(stage, "themes");
            } else if (buttonType == modButton) {
                copyPluginFile(stage, "mod");
            }
        });
    }

    private static void copyPluginFile(Stage stage, String pluginType) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Choisir un plugin (JAR)");
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Fichiers JAR", "*.jar")
        );

        File selectedFile = fileChooser.showOpenDialog(stage);
        if (selectedFile != null) {
            try {
                Path basePath;
                if(pluginType.equals("themes")){
                    basePath = AppFilesPath.getThemesPath();
                } else if(pluginType.equals("mod")){
                    basePath = AppFilesPath.getPluginsPath();
                } else {
                    throw  new RuntimeException("You need to specify the type when saving a file");
                }

                File pluginsDir = basePath.toFile();
                if (!pluginsDir.exists()) pluginsDir.mkdirs();

                File target = new File(pluginsDir, selectedFile.getName());
                Files.copy(selectedFile.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
                System.out.println("Le plugin a été copié dans le dossier /plugins/" + pluginType + ".");
            } catch (IOException ex) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Erreur");
                alert.setHeaderText("Échec de l'ajout du plugin");
                alert.setContentText("Erreur : " + ex.getMessage());
                alert.showAndWait();
                System.out.println("Échec de l'ajout du plugin");
                System.out.println("Erreur : " + ex.getMessage());
            } catch (URISyntaxException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
