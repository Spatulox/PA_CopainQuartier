package com.example.scraper.ui;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class Event {
    private final StringProperty title;
    private final StringProperty date;
    private final StringProperty url;

    public Event(String title, String date, String url) {
        this.title = new SimpleStringProperty(title);
        this.date = new SimpleStringProperty(date);
        this.url = new SimpleStringProperty(url);
    }

    public StringProperty titleProperty() {
        return title;
    }

    public StringProperty dateProperty() {
        return date;
    }

    public StringProperty urlProperty() {
        return url;
    }

    public String getUrl() {
        return url.get();
    }
}
