<?php
/**
 * Plugin Name: Indonesia Regions Manager
 * Plugin URI: 
 * Description: Plugin untuk mengelola data wilayah Indonesia
 * Version: 1.0.0
 * Author: ArisCiwek
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin Constants
define('IR_VERSION', '1.0.0');
define('IR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'IndonesiaRegions\\';
    $base_dir = IR_PLUGIN_DIR . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Initialize Plugin
function init_indonesia_regions() {
    $plugin = new IndonesiaRegions\Core\Plugin();
    $plugin->run();
}
add_action('plugins_loaded', 'init_indonesia_regions');

// Activation Hook
register_activation_hook(__FILE__, function() {
    $activator = new IndonesiaRegions\Core\Activator();
    $activator->activate();
});

// Deactivation Hook
register_deactivation_hook(__FILE__, function() {
    $deactivator = new IndonesiaRegions\Core\Deactivator();
    $deactivator->deactivate();
});
