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
import java.util.*;

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


        Button backButton = new Button("⬅ Retour au menu");
        backButton.setOnAction(e -> {
            MainApp app = new MainApp();
            try {
                app.start(stage);
            } catch (Exception ex) {
                System.err.println("Erreur retour : " + ex.getMessage());
            }
        });

        Button scrapeButton = new Button("Scraper la catégorie");
        scrapeButton.setOnAction(e -> {
            scrapeCurrentCategory();
        });

        HBox header = new HBox(10, backButton, scrapeButton);
        header.setPadding(new Insets(10, 20, 10, 20));
        header.setAlignment(Pos.CENTER_LEFT);

        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(scrollPane);
        return root;
    }

    private VBox buildEventList() {
        List<Event> events = Database.loadFromXml(category);

        VBox box = new VBox(20);
        box.setPadding(new Insets(20));
        box.setAlignment(Pos.CENTER);

        for (Event event : events) {
            Label titleLabel = new Label(event.titleProperty().get());
            titleLabel.setWrapText(true);
            titleLabel.setMaxWidth(200);
            titleLabel.setTextAlignment(TextAlignment.CENTER);
            titleLabel.setStyle("-fx-font-weight: bold; -fx-text-fill: black;");

            Label dateLabel = new Label(event.dateProperty().get());
            dateLabel.setStyle("-fx-text-fill: gray;");

            Button linkButton = new Button("Voir l'événement");
            linkButton.setOnAction(e -> {
                try {
                    Desktop.getDesktop().browse(new URI(event.getUrl()));
                } catch (Exception ex) {
                    System.err.println("Erreur ouverture du lien : " + ex.getMessage());
                }
            });

            VBox card = new VBox(10, titleLabel, dateLabel, linkButton);
            card.setPadding(new Insets(15));
            card.setStyle("-fx-border-color: #ccc; -fx-border-width: 1; -fx-background-color: #f9f9f9;");
            card.setAlignment(Pos.CENTER);

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
}
