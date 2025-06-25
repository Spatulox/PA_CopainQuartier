package com.example.scraper.ui;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import com.example.scraper.ui.PluginHelper;


public class MainApp extends Application {
    @Override
    public void start(Stage primaryStage) {
        Button concertButton = new Button("Voir les concerts");
        Button museeButton = new Button(" Voir les musées");
        Button spectacleButton = new Button(" Voir les spectacles");
        Button pluginButton = new Button("Ajouter un plugin");

        concertButton.setOnAction(e -> showCategory(primaryStage, "concert"));
        museeButton.setOnAction(e -> showCategory(primaryStage, "musee"));
        spectacleButton.setOnAction(e -> showCategory(primaryStage, "spectacle"));
        pluginButton.setOnAction(e -> PluginHelper.showPluginForm(primaryStage));

        VBox menu = new VBox(20, concertButton, museeButton, spectacleButton, pluginButton);
        menu.setStyle("-fx-alignment: center; -fx-padding: 40;");

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
