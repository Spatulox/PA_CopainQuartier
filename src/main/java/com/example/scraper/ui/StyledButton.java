package com.example.scraper.ui;

import javafx.scene.control.Button;

public class StyledButton {
    public Button createStyledButton(String label) {
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
}
