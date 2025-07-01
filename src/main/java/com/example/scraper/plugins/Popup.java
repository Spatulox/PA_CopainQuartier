package com.example.scraper.plugins;

import com.example.scraper.core.Database;
import com.example.scraper.core.Plugin;
import com.example.scraper.pluginutils.InternetRequest;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;

import java.util.List;
import java.util.Map;

public class Popup extends Plugin {
    @Override
    public List<Map<String, Object>> execute(InternetRequest scrapper) throws Exception {
        return List.of();
    }

    @Override
    public VBox view() {
        return null;
    }

    @Override
    public Button HeaderButton(Runnable refreshView) {
        return null;
    }
}
