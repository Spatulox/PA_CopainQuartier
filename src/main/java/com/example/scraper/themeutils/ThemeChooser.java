package com.example.scraper.themeutils;

import com.example.scraper.core.ThemePlugin;
import com.example.scraper.pluginutils.PluginLoader;
import com.example.scraper.pluginutils.PluginManager;
import javafx.scene.control.*;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ThemeChooser {
    public static void chooseTheme() {
        File themesDir = new File("plugins/themes");
        if (!themesDir.exists() || !themesDir.isDirectory()) {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle("Aucun dossier de thèmes");
            alert.setHeaderText("Aucun dossier de thèmes trouvé.");
            alert.setContentText("Merci de créer un dossier plugins/themes et d'y placer vos thèmes.");
            alert.showAndWait();
            return;
        }

        File[] jars = themesDir.listFiles((dir, name) -> name.endsWith(".jar"));
        if (jars == null || jars.length == 0) {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle("Aucun thème");
            alert.setHeaderText("Aucun thème trouvé.");
            alert.setContentText("Merci d'ajouter des fichiers JAR dans plugins/themes.");
            alert.showAndWait();
            return;
        }

        // 1. Identifier le thème actif
        String currentThemeName = null;
        List<String> allThemeNames = new ArrayList<>();
        for (File jar : jars) {
            String name = jar.getName();
            if (name.contains("_active")) {
                currentThemeName = name.replace("_active", "").replace(".jar", "");
            }
            allThemeNames.add(name.replace("_active", "").replace(".jar", ""));
        }
        allThemeNames = allThemeNames.stream().distinct().collect(Collectors.toList());

        // 2. Construire la liste pour le choix
        List<String> themeNames = new ArrayList<>();
        if (currentThemeName != null) {
            themeNames.add("Actuel : " + currentThemeName);
        }
        themeNames.add("Thème par défaut");
        for (String name : allThemeNames) {
            if (currentThemeName == null || !name.equals(currentThemeName)) {
                themeNames.add(name);
            }
        }

        ChoiceDialog<String> dialog = new ChoiceDialog<>(themeNames.get(0), themeNames);
        dialog.setTitle("Choisir un thème");
        dialog.setHeaderText("Sélectionnez le thème à activer");
        dialog.setContentText("Thèmes disponibles :");

        dialog.showAndWait().ifPresent(selectedTheme -> {
            // 1. Désactiver tous les thèmes actifs
            for (File jar : jars) {
                String name = jar.getName();
                if (name.contains("_active")) {
                    File newName = new File(themesDir, name.replace("_active", ""));
                    if (!jar.renameTo(newName)) {
                        System.err.println("Erreur lors de la désactivation du thème : " + jar.getName());
                    }
                }
            }

            // 2. Si l'utilisateur a choisi "Thème par défaut", on ne fait rien de plus
            if (selectedTheme.equals("Thème par défaut")) {
                ThemeManager.setTheme(new DefaultTheme());
                return;
            }

            // 3. Si l'utilisateur a choisi un thème actif (affiché avec "Actuel : "), on l'enlève
            String themeToActivate = selectedTheme.replace("Actuel : ", "");

            // 4. Activer le thème choisi
            File chosenFile = new File(themesDir, themeToActivate + ".jar");
            if (!chosenFile.exists()) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Erreur");
                alert.setHeaderText("Fichier non trouvé");
                alert.setContentText("Le fichier " + themeToActivate + ".jar n'existe pas.");
                alert.showAndWait();
                return;
            }

            File newActiveFile = new File(themesDir, themeToActivate + "_active.jar");
            if (!chosenFile.renameTo(newActiveFile)) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Erreur");
                alert.setHeaderText("Erreur lors de l'activation du thème");
                alert.setContentText("Impossible de renommer le fichier.");
                alert.showAndWait();
                return;
            }

            // 5. Charger le thème choisi
            try {
                ThemePlugin theme = PluginManager.loadTheme();
                ThemeManager.setTheme(theme);
                System.out.println("Le thème " + themeToActivate + " a été activé.");
            } catch (Exception e) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Erreur");
                alert.setHeaderText("Erreur lors du chargement du thème");
                alert.setContentText("Erreur : " + e.getMessage());
                alert.showAndWait();
            }
        });
    }
}
