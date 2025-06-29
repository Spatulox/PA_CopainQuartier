package com.example.scraper.core;

public interface SiteScraperPlugin {
    String getName();
    String getCategory();
    void runScraper();
}
