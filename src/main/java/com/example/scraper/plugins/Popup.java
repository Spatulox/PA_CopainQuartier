package com.example.scraper.plugins;

import com.example.scraper.core.Plugin;
import com.example.scraper.pluginutils.InternetRequest;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class Popup extends Plugin {

    @Override
    public void execute() throws Exception {
        System.out.println("Popup plugin executed!");
        stage.setScene(new Scene(view()));
        stage.setTitle("Popup Plugin Demo");
        stage.show();
    }

    @Override
    public VBox view() {
        VBox vbox = new VBox(10);
        Label label = new Label("Hello, this is a test popup plugin!");
        Button btnClose = new Button("Close");
        btnClose.setOnAction(e -> stage.close());

        vbox.getChildren().addAll(label, btnClose);
        return vbox;
    }

    @Override
    public Button HeaderButton(Runnable refreshView) {
        Button btn = new Button("Test Popup");
        btn.setOnAction(e -> {
            try {
                execute();
                refreshView.run();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
        return btn;
    }

    @Override
    public String name(){
        return "Popup";
    }
}
