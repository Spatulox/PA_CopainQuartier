package com.example.scraper.themeutils;

import com.example.scraper.core.ThemePlugin;
import javafx.scene.control.Button;

public class DefaultTheme extends ThemePlugin {

    @Override
    public Button createButton(String label) {
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

    @Override
    public String rootStyle(){
        return "-fx-background-color: #1f1f1f;";
    }

    @Override
    public Double height(){
        return 600.0;
    }

    @Override
    public Double width(){
        return 900.0;
    }

    @Override
    public String card(){
        return "-fx-border-color: #ddd;" +
                "-fx-border-width: 1;" +
                "-fx-background-color: white;" +
                "-fx-background-radius: 10;" +
                "-fx-border-radius: 10;" +
                "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 4, 0, 0, 2);";
    }

}
