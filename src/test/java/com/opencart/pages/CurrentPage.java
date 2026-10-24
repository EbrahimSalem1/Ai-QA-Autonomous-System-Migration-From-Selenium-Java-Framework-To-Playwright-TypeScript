package com.opencart.pages;

import org.openqa.selenium.WebDriver;

/** Queries that apply to whatever page is currently displayed (heading, alert and content messages). */
public class CurrentPage extends BasePage {

    public CurrentPage(WebDriver driver) {
        super(driver);
    }
}
