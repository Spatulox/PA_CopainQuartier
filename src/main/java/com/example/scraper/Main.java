package com.example.scraper;

public class Main {
    public static void main(String[] args) {
        SiteScraper scraper = new EvousScraper();
        scraper.scrape();
    }
}
