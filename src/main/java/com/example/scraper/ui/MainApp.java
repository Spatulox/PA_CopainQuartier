package com.example.scraper.ui;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import com.example.scraper.pluginutils.PluginHelper;
import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.pluginutils.PluginManager;
import com.example.scraper.core.Database;


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
        pluginButton.setOnAction(e -> PluginHelper.showPluginForm(primaryStage));

        categoryRow.getChildren().addAll(pluginButton);

        // Initialisation du GridPane
        pluginGrid = new GridPane();
        pluginGrid.setHgap(20);
        pluginGrid.setVgap(20);
        pluginGrid.setAlignment(Pos.CENTER);

        root.getChildren().addAll(categoryRow, pluginGrid);

        PluginManager.startPeriodicReload(10, plugins -> {
            Platform.runLater(() -> {
                // Remplace la boucle par un appel à la méthode de PluginManager
                GridPane newGrid = PluginManager.createPluginButtonsGrid(
                        PluginManager.loadPlugins(),
                        plugin -> viewPlugin(primaryStage, plugin)
                        //plugin -> plugin.view(new String[]{/* args si besoin */})
                );
                // On remplace le GridPane dans la racine
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

    private Button createStyledButton(String label) {
        Button button = new Button(label);
        button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #3f51b5;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 4, 0, 0, 2);"
        );
        button.setOnMouseEntered(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #5c6bc0;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.3), 6, 0, 0, 3);"
        ));
        button.setOnMouseExited(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #3f51b5;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 4, 0, 0, 2);"
        ));
        return button;
    }

    private void showCategory(Stage stage, String category) {
        EventViewer viewer = new EventViewer(category);
        Scene scene = new Scene(viewer.getView(stage), 800, 600);
        stage.setScene(scene);
        stage.setTitle("Catégorie : " + category);
    }

    public static void main(String[] args) {
        launch();
    }
}
