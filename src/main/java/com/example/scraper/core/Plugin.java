package com.example.scraper.core;

import com.example.scraper.pluginutils.InternetRequest;
import com.example.scraper.themeutils.ThemeManager;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.util.List;
import java.util.Map;

public abstract class Plugin {
    private ThemePlugin theme;
    protected Stage stage;
    public Plugin() {
        this.theme = ThemeManager.getTheme();
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public ThemePlugin getTheme() {
        return theme;
    }

    public abstract void execute() throws Exception;
    public abstract VBox view();
    public abstract Button HeaderButton(Runnable refreshView);

    public String name(){
        return "Unknown";
    }
}