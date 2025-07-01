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
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.awt.*;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ParisSpectacle extends Plugin {

    private ThemePlugin theme;

    public ParisSpectacle(){
        theme = getTheme();
    }


    @Override
    public List<Map<String, Object>> execute(InternetRequest scrapper) throws Exception {
        List<Map<String, Object>> events = new ArrayList<>();

        Document doc = scrapper.getHtmlDocument("https://www.evous.fr/paris/Spectacles/");
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
    public VBox view(Plugin plugin) {

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
        return "ParisSpectacle";
    }
}
