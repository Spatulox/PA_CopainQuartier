package com.example.scraper.ui;

import javafx.application.Application;
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
        VBox menu = new VBox(20);
        menu.setStyle("-fx-alignment: center; -fx-padding: 40;");

        // Boutons de catégories natives
        Button concertButton = new Button(" Voir les concerts");
        Button museeButton = new Button(" Voir les musées");
        Button spectacleButton = new Button(" Voir les spectacles");
        Button pluginButton = new Button(" Ajouter un plugin");

        concertButton.setOnAction(e -> showCategory(primaryStage, "concert"));
        museeButton.setOnAction(e -> showCategory(primaryStage, "musee"));
        spectacleButton.setOnAction(e -> showCategory(primaryStage, "spectacle"));
        pluginButton.setOnAction(e -> PluginHelper.showPluginForm(primaryStage));

        menu.getChildren().addAll(concertButton, museeButton, spectacleButton, pluginButton);


        for (SiteScraperPlugin plugin : PluginManager.loadPlugins()) {
            String cat = plugin.getCategory();
            Button pluginBtn = new Button(" Voir : " + cat);
            pluginBtn.setOnAction(e -> showCategory(primaryStage, cat));
            menu.getChildren().add(pluginBtn);

            System.out.println("Plugin chargé : " + plugin.getName());
        }

        Scene menuScene = new Scene(menu, 800, 600);
        primaryStage.setScene(menuScene);
        primaryStage.setTitle("Menu des événements");
        primaryStage.show();
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
