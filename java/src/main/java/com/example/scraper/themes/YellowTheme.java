package com.example.scraper.themes;

import com.example.scraper.core.ThemePlugin;
import javafx.scene.control.Button;

public class YellowTheme extends ThemePlugin {
    @Override
    public Button createButton(String label) {
        Button button = new Button(label);
        button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: rgba(63, 81, 181, 0.7);" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-color: rgba(255, 255, 255, 0.3);" +
                        "-fx-border-width: 1;" +
                        "-fx-border-radius: 8;" +
                        "-fx-cursor: hand;"
        );
        button.setOnMouseEntered(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: rgba(92, 107, 192, 0.9);" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-color: rgba(255, 255, 255, 0.4);" +
                        "-fx-border-width: 1;" +
                        "-fx-border-radius: 8;" +
                        "-fx-cursor: hand;"
        ));
        button.setOnMouseExited(e -> button.setStyle(
                "-fx-font-size: 16px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: rgba(63, 81, 181, 0.7);" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-border-color: rgba(255, 255, 255, 0.3);" +
                        "-fx-border-width: 1;" +
                        "-fx-border-radius: 8;" +
                        "-fx-cursor: hand;"
        ));
        return button;
    }

    @Override
    public String rootStyle() {
        return "";
    }

    @Override
    public Double height() {
        return 0.0;
    }

    @Override
    public Double width() {
        return 0.0;
    }

    @Override
    public String card() {
        return "";
    }
}
