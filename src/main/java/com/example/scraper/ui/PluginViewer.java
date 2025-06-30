package com.example.scraper.ui;

import com.example.scraper.core.ScraperPlugin;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.util.List;
import java.util.Map;

public class PluginViewer {
    //private final String category;
    private VBox content;
    private Stage stage;
    private ScraperPlugin plugin;

    public PluginViewer(Stage stage, ScraperPlugin plugin) {

        this.plugin = plugin;
        this.stage = stage;
        this.plugin.view(new String[]{});
    }


    public BorderPane getView() {
        StyledButton styleButton = new StyledButton();
        //content = buildEventList();

        Button backButton = styleButton.createStyledButton("⬅ Retour");
        backButton.setOnAction(e -> {
            MainApp app = new MainApp();
            try {
                app.start(stage);
            } catch (Exception ex) {
                System.err.println("Erreur retour : " + ex.getMessage());
            }
        });

        Button scrapeButton = styleButton.createStyledButton("🔄 Scraper la catégorie");
        scrapeButton.setOnAction(e -> {
            plugin.scrap();
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

    /*private VBox buildEventList() {
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
    }*/
}
