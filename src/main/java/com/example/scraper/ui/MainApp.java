package com.example.scraper.ui;

import com.example.scraper.core.ThemePlugin;
import com.example.scraper.pluginutils.PluginViewer;
import com.example.scraper.themeutils.DefaultTheme;
import com.example.scraper.themeutils.ThemeChooser;
import com.example.scraper.themeutils.ThemeManager;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import com.example.scraper.pluginutils.PluginLoader;
import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.pluginutils.PluginManager;


public class MainApp extends Application {
    private VBox root;
    private GridPane pluginGrid;
    private ThemePlugin theme;

    @Override
    public void start(Stage primaryStage) {
        try {
            theme = PluginManager.loadTheme();
            ThemeManager.setTheme(theme);
        } catch (Exception e) {
            theme = new DefaultTheme();
        }
        refreshUI(primaryStage);
    }

    private void refreshUI(Stage primaryStage) {
        root = new VBox(30);
        root.setAlignment(Pos.TOP_CENTER);
        root.setPadding(new Insets(40));
        root.setStyle(theme.rootStyle());

        Button pluginButton = theme.createButton("Ajouter un plugin");
        pluginButton.setOnAction(e -> PluginLoader.showPluginForm(primaryStage));

        Button themeButton = theme.createButton("Choisir un theme");
        themeButton.setOnAction(e -> {
            ThemeChooser.chooseTheme();
            theme = ThemeManager.getTheme();
            refreshUI(primaryStage);
        });

        HBox categoryRow = new HBox(20);
        categoryRow.setAlignment(Pos.CENTER);
        categoryRow.getChildren().addAll(pluginButton, themeButton);

        pluginGrid = new GridPane();
        pluginGrid.setHgap(20);
        pluginGrid.setVgap(20);
        pluginGrid.setAlignment(Pos.CENTER);

        root.getChildren().addAll(categoryRow, pluginGrid);

        PluginManager.startPeriodicReload(10, plugins -> {
            Platform.runLater(() -> {
                GridPane newGrid = PluginManager.createPluginButtonsGrid(
                        PluginManager.loadPlugins(),
                        plugin -> viewPlugin(primaryStage, plugin)
                );
                root.getChildren().remove(pluginGrid);
                pluginGrid = newGrid;
                root.getChildren().add(pluginGrid);
            });
        });

        // 7. Recréer la scène
        Scene menuScene = new Scene(root, theme.width(), theme.height());
        primaryStage.setScene(menuScene);
        primaryStage.setTitle("Menu des événements");
        primaryStage.show();
    }

    private void viewPlugin(Stage stage, ScraperPlugin plugin) {
        PluginViewer viewer = new PluginViewer(stage, plugin);
        Scene scene = new Scene(viewer.getView(), theme.width(), theme.height());
        stage.setScene(scene);
        stage.setTitle("Nom : " + plugin.name());
    }

    public static void main(String[] args) {
        launch();
    }
}
