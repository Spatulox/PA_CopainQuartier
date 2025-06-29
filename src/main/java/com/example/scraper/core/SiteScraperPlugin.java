package com.example.scraper.core;

public interface SiteScraperPlugin {
    void scrape();
    String getCategory();
    String getName();
}
