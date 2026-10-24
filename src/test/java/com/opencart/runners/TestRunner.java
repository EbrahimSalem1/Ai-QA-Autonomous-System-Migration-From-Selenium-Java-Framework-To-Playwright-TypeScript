package com.opencart.runners;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;

/**
 * Runs every feature through TestNG with scenarios executed in parallel
 * (thread count: data-provider-thread-count in testng.xml / -Dthreads).
 * Filter by tag: mvn verify -Dcucumber.filter.tags="@cart and not @auth"
 */
@CucumberOptions(
        features = "src/test/resources/features",
        glue = {"com.opencart.stepdefinitions", "com.opencart.hooks"},
        plugin = {
                "pretty",
                "html:target/cucumber/cucumber.html",
                "json:target/cucumber/cucumber.json",
                "rerun:target/cucumber/rerun.txt",
                "timeline:target/cucumber/timeline",
                "io.qameta.allure.cucumber7jvm.AllureCucumber7Jvm"
        },
        monochrome = true
)
public class TestRunner extends AbstractTestNGCucumberTests {

    @Override
    @DataProvider(parallel = true)
    public Object[][] scenarios() {
        return super.scenarios();
    }
}
