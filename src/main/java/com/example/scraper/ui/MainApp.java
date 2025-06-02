package com.example.scraper.ui;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class MainApp extends Application {
    @Override
    public void start(Stage stage) {
        var viewer = new EventViewer();
        stage.setScene(new Scene(viewer.getView(), 800, 600));
        stage.setTitle("Événements Evous.fr");
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}
