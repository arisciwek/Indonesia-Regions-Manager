<?php
namespace IndonesiaRegions\Core;
// File: includes/Core/Activator.php

class Activator {
    /**
     * Plugin activation handler.
     */
    public static function activate() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = array();

        // Create provinces table
        $table_provinces = $wpdb->prefix . 'provinces';
        $sql[] = "CREATE TABLE IF NOT EXISTS $table_provinces (
            id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY name (name)
        ) $charset_collate;";

        // Create cities table
        $table_cities = $wpdb->prefix . 'cities';
        $sql[] = "CREATE TABLE IF NOT EXISTS $table_cities (
            id int NOT NULL AUTO_INCREMENT,
            province_id int NOT NULL,
            name varchar(100) NOT NULL,
            type enum('kabupaten', 'kota') NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (province_id) REFERENCES ${table_provinces}(id) ON DELETE CASCADE
        ) $charset_collate;";

        // Execute table creation
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        foreach ($sql as $query) {
            dbDelta($query);
        }

        // Add/update plugin version
        add_option('ir_version', IR_VERSION);
        add_option('ir_activation_time', time());

        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Trigger action for other components
        do_action('ir_activated');
    }
}
