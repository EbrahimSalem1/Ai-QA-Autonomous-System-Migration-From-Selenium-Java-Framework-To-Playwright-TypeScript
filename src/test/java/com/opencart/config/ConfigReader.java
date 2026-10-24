package com.opencart.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Properties;

/**
 * Single source of configuration.
 * Resolution order: JVM system property (-Dbase.url) &gt; environment variable (BASE_URL) &gt; config.properties.
 */
public final class ConfigReader {

    private static final Properties PROPERTIES = load();

    private ConfigReader() {
    }

    private static Properties load() {
        Properties properties = new Properties();
        try (InputStream in = ConfigReader.class.getClassLoader().getResourceAsStream("config/config.properties")) {
            if (in == null) {
                throw new IllegalStateException("config/config.properties not found on the test classpath");
            }
            properties.load(in);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to read config/config.properties", e);
        }
        return properties;
    }

    public static String get(String key) {
        String fromSystem = System.getProperty(key);
        if (isSet(fromSystem)) {
            return fromSystem.trim();
        }
        String fromEnv = System.getenv(key.toUpperCase(Locale.ROOT).replace('.', '_'));
        if (isSet(fromEnv)) {
            return fromEnv.trim();
        }
        String fromFile = PROPERTIES.getProperty(key);
        return fromFile == null ? "" : fromFile.trim();
    }

    public static int getInt(String key) {
        return Integer.parseInt(get(key));
    }

    public static boolean getBoolean(String key) {
        return Boolean.parseBoolean(get(key));
    }

    public static String baseUrl() {
        String url = get("base.url");
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public static String language() {
        return get("language");
    }

    private static boolean isSet(String value) {
        return value != null && !value.isBlank();
    }
}
