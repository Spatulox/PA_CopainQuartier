package com.example.scraper.core;

import com.example.scraper.plugins.EvousScraper;

public class Main {
    public static void main(String[] args) {
        SiteScraper scraper = new EvousScraper();
        scraper.scrape();
    }
}
