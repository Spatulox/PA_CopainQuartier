package com.example.scraper.ui;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import com.example.scraper.pluginutils.PluginHelper;
import com.example.scraper.core.SiteScraperPlugin;
import com.example.scraper.pluginutils.PluginManager;

public class MainApp extends Application {

    @Override
    public void start(Stage primaryStage) {
        VBox menu = new VBox(15);
        menu.setAlignment(Pos.CENTER);
        menu.setPadding(new Insets(40));
        menu.setStyle("-fx-background-color: #1f1f1f;");

        // Boutons des catégories principales
        Button concertButton = createStyledButton(" Voir les concerts");
        Button museeButton = createStyledButton(" Voir les musées");
        Button spectacleButton = createStyledButton(" Voir les spectacles");
        Button pluginButton = createStyledButton(" Ajouter un plugin");

        concertButton.setOnAction(e -> showCategory(primaryStage, "concert"));
        museeButton.setOnAction(e -> showCategory(primaryStage, "musee"));
        spectacleButton.setOnAction(e -> showCategory(primaryStage, "spectacle"));
        pluginButton.setOnAction(e -> PluginHelper.showPluginForm(primaryStage));

        menu.getChildren().addAll(concertButton, museeButton, spectacleButton, pluginButton);

        // Chargement dynamique des plugins
        for (SiteScraperPlugin plugin : PluginManager.loadPlugins()) {
            String cat = plugin.getCategory();
            Button pluginBtn = createStyledButton("🔌 Voir : " + cat);
            pluginBtn.setOnAction(e -> showCategory(primaryStage, cat));
            menu.getChildren().add(pluginBtn);
            System.out.println("Plugin chargé : " + plugin.getName());
        }

        Scene menuScene = new Scene(menu, 800, 600);
        primaryStage.setScene(menuScene);
        primaryStage.setTitle("🎫 Menu des événements");
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
