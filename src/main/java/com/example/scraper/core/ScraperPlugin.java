package com.example.scraper.core;

import java.util.List;
import java.util.Map;

public interface ScraperPlugin {
    List<Map<String, Object>> scrap();
    void view(String[] args);
    String name();
    String category();
}
