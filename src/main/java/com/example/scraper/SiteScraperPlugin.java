package com.example.scraper;

public interface SiteScraperPlugin {
    void scrape();
    String getCategory();
    String getName();
}
