package com.opencart.utils;

import com.opencart.config.ConfigReader;
import org.openqa.selenium.Cookie;

import java.util.Optional;
import java.util.Set;

/**
 * Selenium equivalent of Playwright's storageState: the authenticated cookies of one shared customer
 * are captured once per JVM and injected into every @auth scenario, so the UI login runs only once.
 */
public final class AuthSessionStore {

    private static volatile Set<Cookie> cookies;
    private static volatile TestDataFactory.Customer customer;

    private AuthSessionStore() {
    }

    public static synchronized Optional<Set<Cookie>> cookies() {
        return Optional.ofNullable(cookies);
    }

    public static synchronized void save(TestDataFactory.Customer authenticatedCustomer, Set<Cookie> sessionCookies) {
        customer = authenticatedCustomer;
        cookies = Set.copyOf(sessionCookies);
    }

    public static synchronized TestDataFactory.Customer customer() {
        return customer;
    }

    /** A pre-provisioned account from config/env, if one was supplied. */
    public static Optional<TestDataFactory.Customer> configuredCustomer() {
        String email = ConfigReader.get("customer.email");
        String password = ConfigReader.get("customer.password");
        if (email.isBlank() || password.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(new TestDataFactory.Customer("QA", "Customer", email, "", password));
    }
}
