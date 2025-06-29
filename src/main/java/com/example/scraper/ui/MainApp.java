package com.example.scraper.ui;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import com.example.scraper.pluginutils.PluginHelper;
import com.example.scraper.core.SiteScraperPlugin;
import com.example.scraper.pluginutils.PluginManager;
import com.example.scraper.core.PluginDatabase;
import com.example.scraper.core.Database;


public class MainApp extends Application {

    @Override
    public void start(Stage primaryStage) {

        PluginDatabase.setInstance((title, url, date, category ) -> {
            Database.saveEvent(title, url, date, category ,"plugin");
        });

        VBox root = new VBox(30);
        root.setAlignment(Pos.TOP_CENTER);
        root.setPadding(new Insets(40));
        root.setStyle("-fx-background-color: #1f1f1f;");

        HBox categoryRow = new HBox(20);
        categoryRow.setAlignment(Pos.CENTER);

        Button concertButton = createStyledButton("Concerts");
        Button museeButton = createStyledButton("️Musées");
        Button spectacleButton = createStyledButton("Spectacles");
        Button pluginButton = createStyledButton("Ajouter un plugin");

        concertButton.setOnAction(e -> showCategory(primaryStage, "concert"));
        museeButton.setOnAction(e -> showCategory(primaryStage, "musee"));
        spectacleButton.setOnAction(e -> showCategory(primaryStage, "spectacle"));
        pluginButton.setOnAction(e -> PluginHelper.showPluginForm(primaryStage));

        categoryRow.getChildren().addAll(concertButton, museeButton, spectacleButton, pluginButton);


        GridPane pluginGrid = new GridPane();
        pluginGrid.setHgap(20);
        pluginGrid.setVgap(20);
        pluginGrid.setAlignment(Pos.CENTER);

        int col = 0;
        int row = 0;
        for (SiteScraperPlugin plugin : PluginManager.loadPlugins()) {
            String cat = plugin.getCategory();
            Button pluginBtn = createStyledButton("🔌 " + cat);
            pluginBtn.setOnAction(e -> showCategory(primaryStage, cat));

            pluginGrid.add(pluginBtn, col, row);

            col++;
            if (col == 3) {
                col = 0;
                row++;
            }

            System.out.println("Plugin chargé : " + plugin.getName());
        }

        root.getChildren().addAll(categoryRow, pluginGrid);

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
