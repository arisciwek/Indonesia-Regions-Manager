<?php
namespace IndonesiaRegions\Core;
/**
 * File: includes/Core/Plugin.php
 * Version: 1.1.0
 * 
 * Changelog:
 * - Add CityController initialization
 * - Add City controller dependency injection
 * - Separate Province and City hooks
 */

class Plugin {
    /**
     * Loader instance untuk mengelola hooks.
     */
    protected $loader;

    /**
     * Plugin version.
     */
    protected $version;

    /**
     * Plugin slug.
     */
    protected $plugin_slug;

    /**
     * Initialize plugin core functionality.
     */
    public function __construct() {
        $this->version = IR_VERSION;
        $this->plugin_slug = 'indonesia-regions';
        $this->loader = new Loader();

        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Register semua hooks terkait admin area.
     */
    private function define_admin_hooks() {
        // Initialize controllers
        $province_controller = new \IndonesiaRegions\Controllers\ProvinceController();
        $city_controller = new \IndonesiaRegions\Controllers\CityController();
        
        // Menu hooks
        $this->loader->add_action('admin_menu', $province_controller, 'register_menu');
        
        // Assets hooks
        $this->loader->add_action('admin_enqueue_scripts', $province_controller, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $province_controller, 'enqueue_scripts');
        
        // AJAX hooks untuk provinces
        $this->loader->add_action('wp_ajax_ir_get_provinces', $province_controller, 'ajax_get_provinces');
        $this->loader->add_action('wp_ajax_ir_get_province', $province_controller, 'ajax_get_province');
        $this->loader->add_action('wp_ajax_ir_create_province', $province_controller, 'ajax_create_province');
        $this->loader->add_action('wp_ajax_ir_update_province', $province_controller, 'ajax_update_province');
        $this->loader->add_action('wp_ajax_ir_delete_province', $province_controller, 'ajax_delete_province');
        $this->loader->add_action('wp_ajax_ir_check_province_name', $province_controller, 'ajax_check_province_name');

        // AJAX hooks untuk cities
        $this->loader->add_action('wp_ajax_ir_city_get_all', $city_controller, 'ajax_get_all');
        $this->loader->add_action('wp_ajax_ir_city_get', $city_controller, 'ajax_get');
        $this->loader->add_action('wp_ajax_ir_city_create', $city_controller, 'ajax_create');
        $this->loader->add_action('wp_ajax_ir_city_update', $city_controller, 'ajax_update');
        $this->loader->add_action('wp_ajax_ir_city_delete', $city_controller, 'ajax_delete');
        $this->loader->add_action('wp_ajax_ir_city_check_name', $city_controller, 'ajax_check_name');
    }

    /**
     * Register semua hooks terkait public area.
     */
    private function define_public_hooks() {
        // Future implementation untuk public hooks
    }

    /**
     * Run the loader untuk eksekusi semua hooks.
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Reference ke loader object.
     */
    public function get_loader() {
        return $this->loader;
    }

    /**
     * Plugin version getter.
     */
    public function get_version() {
        return $this->version;
    }

    /**
     * Plugin slug getter.
     */
    public function get_plugin_slug() {
        return $this->plugin_slug;
    }
}