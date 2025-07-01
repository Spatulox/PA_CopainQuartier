package com.example.scraper.plugins;
import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.core.ThemePlugin;
import com.example.scraper.pluginutils.PluginScrap;
import com.example.scraper.themeutils.ThemeManager;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import org.jsoup.nodes.Document;

import java.awt.*;
import java.net.URI;
import java.util.*;
import java.util.List;

public class Test extends ScraperPlugin {

    private ThemePlugin theme;

    public Test(){
        theme = getTheme();
    }

    @Override
    public List<Map<String, Object>> scrap(PluginScrap scrapper) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();

        Document doc = scrapper.scrap("https://pariseventicket.com/");

        // Données factices
        Map<String, Object> event1 = new HashMap<>();
        event1.put("title", "Match de Football");
        event1.put("url", "https://pariseventicket.com/football");
        event1.put("date", "2025-07-15");
        events.add(event1);

        Map<String, Object> event2 = new HashMap<>();
        event2.put("title", "Concert");
        event2.put("url", "https://pariseventicket.com/concert");
        event2.put("date", "2025-08-20");
        events.add(event2);

        return events;
    }

    @Override
    public VBox view(VBox box, List<Map<String, Object>> data) {

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

            Button linkButton = theme.createButton("🔗 Voir l'événement");
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
            card.setStyle(theme.card());

            box.getChildren().add(card);
        }

        return box;
    }

    @Override
    public String name() {
        return "Test";
    }
}
