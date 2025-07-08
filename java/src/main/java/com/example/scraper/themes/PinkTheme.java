package com.example.scraper.themes;

import com.example.scraper.core.ThemePlugin;
import javafx.scene.control.Button;

public class PinkTheme extends ThemePlugin {
    @Override
    public Button createButton(String label) {
        Button button = new Button(label);
        button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #4caf50;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-radius: 8;" +
                        "-fx-border-width: 0;" +
                        "-fx-cursor: hand;"
        );
        button.setOnMouseEntered(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #66bb6a;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-radius: 8;" +
                        "-fx-border-width: 0;" +
                        "-fx-cursor: hand;"
        ));
        button.setOnMouseExited(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #4caf50;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-radius: 8;" +
                        "-fx-border-width: 0;" +
                        "-fx-cursor: hand;"
        ));
        return button;
    }

    @Override
    public String rootStyle() {
        return "-fx-background-color: #e62496;";
    }

    @Override
    public Double height() {
        return 600.0;
    }

    @Override
    public Double width() {
        return 900.0;
    }

    @Override
    public String card() {
        return "-fx-border-color: #d4d414;" +
                "-fx-border-width: 1;" +
                "-fx-background-color: #be14d4;" +
                "-fx-background-radius: 10;" +
                "-fx-border-radius: 10;" +
                "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 4, 0, 0, 2);";
    }
}
