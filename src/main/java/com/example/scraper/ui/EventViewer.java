package com.example.scraper.ui;

import com.example.scraper.EvousScraper;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.control.ScrollPane;
import org.w3c.dom.*;
import javafx.scene.text.TextAlignment;


import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.net.URI;
import java.awt.Desktop;

public class EventViewer {

    private final GridPane grid = new GridPane();

    public BorderPane getView() {

        Button scrapeButton = new Button("scrappe");
        scrapeButton.setOnAction(e -> {
            new EvousScraper().scrape();
            loadData();
        });

        HBox topBox = new HBox(scrapeButton);
        topBox.setAlignment(Pos.CENTER);
        topBox.setPadding(new Insets(10));

        grid.setPadding(new Insets(20));
        grid.setHgap(20);
        grid.setVgap(20);
        grid.setAlignment(Pos.TOP_CENTER);

        ScrollPane scrollPane = new ScrollPane(grid);
        scrollPane.setFitToWidth(true);
        scrollPane.setPadding(new Insets(10));
        scrollPane.setStyle("-fx-background: #444444;");

        BorderPane root = new BorderPane();
        root.setTop(topBox);
        root.setCenter(scrollPane);

        loadData();
        return root;
    }

    private void loadData() {
        grid.getChildren().clear();

        try {
            File xmlFile = new File("events.xml");
            if (!xmlFile.exists()) return;

            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlFile);
            NodeList nodes = doc.getElementsByTagName("event");

            int row = 0;
            int col = 0;

            for (int i = 0; i < nodes.getLength(); i++) {
                Element e = (Element) nodes.item(i);
                String title = e.getElementsByTagName("title").item(0).getTextContent();
                String date = e.getElementsByTagName("date").item(0).getTextContent();
                String url = e.getElementsByTagName("url").item(0).getTextContent();

                VBox card = createEventCard(title, date, url);
                grid.add(card, col, row);

                col++;
                if (col == 3) {
                    col = 0;
                    row++;
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur lecture XML : " + e.getMessage());
        }
    }

    private VBox createEventCard(String title, String date, String url) {
        Label titleLabel = new Label(title);
        titleLabel.setStyle("-fx-font-weight: bold; -fx-font-size: 12px; -fx-text-fill: black;");
        titleLabel.setWrapText(true);
        titleLabel.setMaxWidth(180);
        titleLabel.setAlignment(Pos.CENTER);
        titleLabel.setTextAlignment(TextAlignment.CENTER);

        Label dateLabel = new Label(date);
        dateLabel.setStyle("-fx-font-size: 12px; -fx-text-fill: gray;");

        Button actionButton = new Button("Voir");
        actionButton.setOnAction(e -> {
            try {
                Desktop.getDesktop().browse(new URI(url));
            } catch (Exception ex) {
                System.err.println("Impossible d'ouvrir l'URL : " + ex.getMessage());
            }
        });

        VBox box = new VBox(5, titleLabel, dateLabel, actionButton);
        box.setPadding(new Insets(10));
        box.setStyle("-fx-background-color: #eeeeee; -fx-border-color: lightgray;");
        box.setPrefWidth(180);
        box.setAlignment(Pos.CENTER);

        return box;
    }
}
