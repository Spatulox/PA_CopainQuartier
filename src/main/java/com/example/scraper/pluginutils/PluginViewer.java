package com.example.scraper.pluginutils;

import com.example.scraper.core.Database;
import com.example.scraper.core.ScraperPlugin;
import com.example.scraper.core.ThemePlugin;
import com.example.scraper.themeutils.ThemeManager;
import com.example.scraper.ui.MainApp;
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
    private ScrollPane scrollPane;
    private ThemePlugin theme;

    public PluginViewer(Stage stage, ScraperPlugin plugin) {
        this.plugin = plugin;
        this.stage = stage;
        theme = ThemeManager.getTheme();
    }


    public BorderPane getView() {
        content = buildEventList();

        Button backButton = theme.createButton("⬅ Retour");
        backButton.setOnAction(e -> {
            MainApp app = new MainApp();
            try {
                app.start(stage);
            } catch (Exception ex) {
                System.err.println("Erreur retour : " + ex.getMessage());
            }
        });

        Button scrapeButton = theme.createButton("🔄 Scraper la catégorie");
        scrapeButton.setOnAction(e -> {
            PluginScrap scrapper = new PluginScrap();
            List<Map<String, Object>> res = null;
            try {
                res = plugin.scrap(scrapper);
                if(!res.isEmpty()){
                    Database.saveEvent(res, plugin.name());
                    refreshView();
                    return;
                }
                System.out.println("Nothing to scrap wtf");
            } catch (Exception ex) {
                System.out.println("Erreur lors du scraping : " + ex.getMessage());
                throw new RuntimeException(ex);
            }
        });

        HBox header = new HBox(20, backButton, scrapeButton);
        header.setPadding(new Insets(20));
        header.setAlignment(Pos.CENTER_LEFT);
        header.setStyle("-fx-background-color: #e0e0e0; -fx-border-color: #ccc;");

        scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent;");

        BorderPane root = new BorderPane();
        root.setTop(header);
        root.setCenter(scrollPane);
        root.setStyle("-fx-background-color: #f4f4f4;");
        return root;
    }

    private VBox buildEventList() {
        List<Map<String, Object>> res = Database.loadFromJson(plugin.name());
        VBox box = new VBox(20);
        box.setPadding(new Insets(30));
        box.setAlignment(Pos.CENTER);
        return plugin.view(box, res);
    }

    private void refreshView() {
        content = buildEventList();
        scrollPane.setContent(content);
    }
}
