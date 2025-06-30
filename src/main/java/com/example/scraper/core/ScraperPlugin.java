package com.example.scraper.core;

import javafx.scene.layout.VBox;

import java.util.List;
import java.util.Map;

public interface ScraperPlugin {
    List<Map<String, Object>> scrap();
    VBox view(VBox box, List<Map<String, Object>> data);
    String name();
    String category();
}
