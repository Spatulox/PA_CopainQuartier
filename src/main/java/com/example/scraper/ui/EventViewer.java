package com.example.scraper.ui;

import com.example.scraper.core.Database;
import com.example.scraper.plugins.EvousScraper;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;
import javafx.scene.text.TextAlignment;
import javafx.stage.Stage;

import java.awt.Desktop;
import java.net.URI;
import java.util.List;

public class EventViewer {
    private final String category;
    private VBox content;
    private Stage stage;

    public EventViewer(String category) {
        this.category = category;
    }

    public BorderPane getView(Stage stage) {
        this.stage = stage;
        content = buildEventList();

        Button backButton = createStyledButton("⬅ Retour");
        backButton.setOnAction(e -> {
            MainApp app = new MainApp();
            try {
                app.start(stage);
            } catch (Exception ex) {
                System.err.println("Erreur retour : " + ex.getMessage());
            }
        });

        Button scrapeButton = createStyledButton("🔄 Scraper la catégorie");
        scrapeButton.setOnAction(e -> {
            scrapeCurrentCategory();
        });

        HBox header = new HBox(20, backButton, scrapeButton);
        header.setPadding(new Insets(20));
        header.setAlignment(Pos.CENTER_LEFT);
        header.setStyle("-fx-background-color: #e0e0e0; -fx-border-color: #ccc;");

        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent;");

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(scrollPane);
        root.setStyle("-fx-background-color: #f4f4f4;");
        return root;
    }

    private VBox buildEventList() {
        List<Event> events = Database.loadFromXml(category);
        VBox box = new VBox(20);
        box.setPadding(new Insets(30));
        box.setAlignment(Pos.CENTER);

        for (Event event : events) {
            Label titleLabel = new Label(event.titleProperty().get());
            titleLabel.setWrapText(true);
            titleLabel.setMaxWidth(300);
            titleLabel.setTextAlignment(TextAlignment.CENTER);
            titleLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: #333;");

            Label dateLabel = new Label("📅 " + event.dateProperty().get());
            dateLabel.setStyle("-fx-text-fill: #666;");

            Button linkButton = createStyledButton("🔗 Voir l'événement");
            linkButton.setOnAction(e -> {
                try {
                    Desktop.getDesktop().browse(new URI(event.getUrl()));
                } catch (Exception ex) {
                    System.err.println("Erreur ouverture du lien : " + ex.getMessage());
                }
            });

            VBox card = new VBox(10, titleLabel, dateLabel, linkButton);
            card.setPadding(new Insets(20));
            card.setAlignment(Pos.CENTER);
            card.setStyle(
                    "-fx-border-color: #ddd;" +
                            "-fx-border-width: 1;" +
                            "-fx-background-color: white;" +
                            "-fx-background-radius: 10;" +
                            "-fx-border-radius: 10;" +
                            "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 4, 0, 0, 2);"
            );

            box.getChildren().add(card);
        }

        return box;
    }

    private void scrapeCurrentCategory() {
        new EvousScraper().scrape(category);
        refresh();
    }

    private void refresh() {
        VBox newContent = buildEventList();
        content.getChildren().setAll(newContent.getChildren());
    }

    private Button createStyledButton(String label) {
        Button button = new Button(label);
        button.setStyle(
                "-fx-font-size: 14px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #3f51b5;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-cursor: hand;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 3, 0, 0, 1);"
        );
        button.setOnMouseEntered(e -> button.setStyle(
                "-fx-font-size: 14px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #5c6bc0;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-cursor: hand;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.3), 4, 0, 0, 2);"
        ));
        button.setOnMouseExited(e -> button.setStyle(
                "-fx-font-size: 14px;" +
                        "-fx-padding: 10 20;" +
                        "-fx-background-color: #3f51b5;" +
                        "-fx-text-fill: white;" +
                        "-fx-background-radius: 8;" +
                        "-fx-cursor: hand;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 3, 0, 0, 1);"
        ));
        return button;
    }
}
