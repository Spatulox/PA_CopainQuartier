package com.example.scraper.pluginutils;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class PluginScrap {
    public Document scrap(String url) throws Exception {
        return Jsoup.connect(url).userAgent("Mozilla/5.0").get();
    }
}
