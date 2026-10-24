package com.opencart.utils;

import net.datafaker.Faker;

import java.util.Locale;
import java.util.UUID;

/** Generates unique, realistic test data so scenarios never collide on shared environments. */
public final class TestDataFactory {

    private static final Faker FAKER = new Faker(Locale.UK);
    public static final String DEFAULT_PASSWORD = "Test@12345";

    private TestDataFactory() {
    }

    public static Customer newCustomer() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String firstName = FAKER.name().firstName();
        String lastName = FAKER.name().lastName();
        String email = ("qa." + firstName + "." + unique + "@example.com").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9.@]", "");
        return new Customer(firstName, lastName, email, "07" + FAKER.number().digits(9), DEFAULT_PASSWORD);
    }

    public static Address newAddress() {
        return new Address(FAKER.address().streetAddress(), FAKER.address().city(), "SW1A 1AA");
    }

    public static String unregisteredEmail() {
        return "not.registered." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    public record Customer(String firstName, String lastName, String email, String telephone, String password) {
    }

    public record Address(String address1, String city, String postcode) {
    }
}
