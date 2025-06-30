package com.example.scraper.plugins;

import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.pluginutils.PluginScrap;
import com.example.scraper.ui.StyledButton;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.awt.*;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ParisConcert extends ScraperPlugin {
    protected String url = "";

    @Override
    public List<Map<String, Object>> scrap(PluginScrap scrapper) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();

        Document doc = scrapper.scrap("https://paris.evous.fr/musees-de-paris/");
        Elements eventElements = doc.select("h3.event-title");

        for (Element h3 : eventElements) {
            Element link = h3.selectFirst("a");
            if (link == null) continue;

            String title = link.text();
            String url = link.absUrl("href");
            Element dateElement = h3.nextElementSibling();
            String date = (dateElement != null && dateElement.hasClass("date")) ? dateElement.text() : "Date non trouvée";

            Map<String, Object> event = new HashMap<>();
            event.put("title", title);
            event.put("url", url);
            event.put("date", date);
            events.add(event);
        }

        // Si aucune donnée n'est trouvée, tu peux ajouter un message ou retourner une liste vide
        return events;
    }

    @Override
    public VBox view(VBox box, List<Map<String, Object>> data) {
        StyledButton styledButton = new StyledButton();

        // Parcours chaque événement
        for (Map<String, Object> event : data) {
            String title = (String) event.getOrDefault("title", "Sans titre");
            String date = (String) event.getOrDefault("date", "Date inconnue");
            String url = (String) event.getOrDefault("url", "#");

            // Crée les composants graphiques
            Label titleLabel = new Label(title);
            titleLabel.setWrapText(true);
            titleLabel.setMaxWidth(300);
            titleLabel.setTextAlignment(javafx.scene.text.TextAlignment.CENTER);
            titleLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: #333;");

            Label dateLabel = new Label("📅 " + date);
            dateLabel.setStyle("-fx-text-fill: #666;");

            Button linkButton = styledButton.createStyledButton("🔗 Voir l'événement");
            linkButton.setOnAction(e -> {
                try {
                    Desktop.getDesktop().browse(new URI(url));
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

    @Override
    public String name() {
        return "ParisMusée";
    }
}
