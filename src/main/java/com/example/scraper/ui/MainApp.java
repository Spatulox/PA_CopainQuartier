package com.example.scraper.ui;

import com.example.scraper.pluginutils.PluginViewer;
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

    @Override
    public void start(Stage primaryStage) {
        root = new VBox(30);
        root.setAlignment(Pos.TOP_CENTER);
        root.setPadding(new Insets(40));
        root.setStyle("-fx-background-color: #1f1f1f;");

        HBox categoryRow = new HBox(20);
        categoryRow.setAlignment(Pos.CENTER);

        StyledButton styledButton = new StyledButton();
        Button pluginButton = styledButton.createStyledButton("Ajouter un plugin");
        pluginButton.setOnAction(e -> PluginLoader.showPluginForm(primaryStage));

        categoryRow.getChildren().addAll(pluginButton);

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

        Scene menuScene = new Scene(root, 900, 600);
        primaryStage.setScene(menuScene);
        primaryStage.setTitle("Menu des événements");
        primaryStage.show();
    }

    private void viewPlugin(Stage stage, ScraperPlugin plugin) {
        PluginViewer viewer = new PluginViewer(stage, plugin);
        Scene scene = new Scene(viewer.getView(), 900, 600);
        stage.setScene(scene);
        stage.setTitle("Nom : " + plugin.name());
    }

    public static void main(String[] args) {
        launch();
    }
}
