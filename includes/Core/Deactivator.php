<?php
namespace IndonesiaRegions\Core;
// File: includes/Core/Deactivator.php

class Deactivator {
    /**
     * Plugin deactivation handler.
     */
    public static function deactivate() {
        // Trigger action before deactivation
        do_action('ir_before_deactivate');

        // Clear any scheduled hooks
        wp_clear_scheduled_hook('ir_daily_cleanup');
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Optionally remove plugin data
        if (get_option('ir_remove_data_on_deactivate', false)) {
            self::remove_plugin_data();
        }

        // Trigger action after deactivation
        do_action('ir_deactivated');
    }

    /**
     * Remove plugin data if configured to do so.
     */
    private static function remove_plugin_data() {
        global $wpdb;
        
        // Remove tables
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}cities");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}provinces");
        
        // Remove options
        delete_option('ir_version');
        delete_option('ir_activation_time');
        delete_option('ir_remove_data_on_deactivate');
        
        // Clean up any transients
        delete_transient('ir_provinces_cache');
        delete_transient('ir_cities_cache');
    }
}