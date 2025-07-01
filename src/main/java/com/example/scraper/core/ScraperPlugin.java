package com.example.scraper.core;

import com.example.scraper.pluginutils.PluginScrap;
import com.example.scraper.themeutils.ThemeManager;
import javafx.scene.layout.VBox;

import java.util.List;
import java.util.Map;

public abstract class ScraperPlugin {
    private ThemePlugin theme;
    public ScraperPlugin() {
        this.theme = ThemeManager.getTheme();
    }

    public ThemePlugin getTheme() {
        return theme;
    }

    public abstract List<Map<String, Object>> scrap(PluginScrap scrapper) throws Exception;
    public abstract VBox view(VBox box, List<Map<String, Object>> data);

    public String name(){
        return "Unknown";
    }
}