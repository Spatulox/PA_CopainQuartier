package com.example.scraper.ui;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

public class Event {
    private final StringProperty title;
    private final StringProperty date;

    public Event(String title, String date) {
        this.title = new SimpleStringProperty(title);
        this.date = new SimpleStringProperty(date);
    }

    public StringProperty titleProperty() {
        return title;
    }

    public StringProperty dateProperty() {
        return date;
    }
}
