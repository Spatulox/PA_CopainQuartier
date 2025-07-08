package com.example.scraper.core;

import javafx.scene.control.Button;

public abstract class ThemePlugin{
    public abstract Button createButton(String label);
    public abstract String rootStyle();
    public abstract Double height();
    public abstract Double width();
    public abstract String card();
}