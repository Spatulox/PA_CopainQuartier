package com.example.scraper.core;

import com.example.scraper.pluginutils.InternetRequest;
import com.example.scraper.themeutils.ThemeManager;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;

import java.util.List;
import java.util.Map;

public abstract class Plugin {
    private ThemePlugin theme;
    public Plugin() {
        this.theme = ThemeManager.getTheme();
    }
    public ThemePlugin getTheme() {
        return theme;
    }

    public abstract List<Map<String, Object>> execute(InternetRequest scrapper) throws Exception;
    public abstract VBox view(VBox box, List<Map<String, Object>> data);
    public abstract Button HeaderButton(Runnable refreshView);

    public String name(){
        return "Unknown";
    }
}