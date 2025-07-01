package com.example.scraper.plugins;
import com.example.scraper.core.Database;
import com.example.scraper.core.Plugin;
import com.example.scraper.core.ThemePlugin;
import com.example.scraper.pluginutils.InternetRequest;
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

public class Test extends Plugin {

    private ThemePlugin theme;

    public Test(){
        theme = getTheme();
    }

    @Override
    public List<Map<String, Object>> execute(InternetRequest scrapper) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();

        Document doc = scrapper.getHtmlDocument("https://pariseventicket.com/");

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
    public VBox view() {

        List<Map<String, Object>> data = Database.loadFromJson(plugin.name());
        VBox box = new VBox(20);
        box.setPadding(new Insets(30));
        box.setAlignment(Pos.CENTER);

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
    public Button HeaderButton(Runnable refreshView){
        Button scrapeButton = theme.createButton("🔄 Scraper la catégorie");
        scrapeButton.setOnAction(e -> {
            InternetRequest scrapper = new InternetRequest();
            List<Map<String, Object>> res = null;
            try {
                res = execute(scrapper);
                if(!res.isEmpty()){
                    Database.saveEvent(res, name());
                    refreshView.run();
                    return;
                }
                System.out.println("Nothing to scrap wtf");
            } catch (Exception ex) {
                System.out.println("Erreur lors du scraping : " + ex.getMessage());
                throw new RuntimeException(ex);
            }
        });
        return scrapeButton;
    }

    @Override
    public String name() {
        return "Test";
    }
}
