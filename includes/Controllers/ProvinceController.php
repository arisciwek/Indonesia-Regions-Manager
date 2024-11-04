<?php
namespace IndonesiaRegions\Controllers;

class ProvinceController {
    private $model;
    private $loader;
    
    public function __construct() {
        $this->model = new \IndonesiaRegions\Models\Province();
    }

    /**
     * Register admin menu
     */
    public function register_menu() {
        add_menu_page(
            'Indonesia Regions',
            'Indonesia Regions',
            'manage_options',
            'indonesia-regions',
            array($this, 'render_main_page'),
            'dashicons-location',
            30
        );
    }

    /**
     * Set loader instance
     */
    public function set_loader($loader) {
        $this->loader = $loader;
        $this->define_admin_hooks();
    }

    /**
     * Render main admin page
     */
    public function render_main_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }

        echo '<div class="ir-provinces-container">';
        require_once IR_PLUGIN_DIR . 'includes/Views/admin/provinces/list.php';
        require_once IR_PLUGIN_DIR . 'includes/Views/admin/provinces/detail.php';
        echo '</div>';
    }

    /**
     * Define admin hooks
     */
    private function define_admin_hooks() {
        // Menu hooks
        $this->loader->add_action('admin_menu', $this, 'register_menu');
        
        // Assets hooks
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');
        
        // AJAX hooks untuk provinces
        $this->loader->add_action('wp_ajax_ir_get_provinces', $this, 'ajax_get_provinces');
        $this->loader->add_action('wp_ajax_ir_get_province', $this, 'ajax_get_province');
        $this->loader->add_action('wp_ajax_ir_create_province', $this, 'ajax_create_province');
        $this->loader->add_action('wp_ajax_ir_update_province', $this, 'ajax_update_province');
        $this->loader->add_action('wp_ajax_ir_delete_province', $this, 'ajax_delete_province');
        
        // Tambahkan hook baru untuk check nama provinsi
        $this->loader->add_action('wp_ajax_ir_check_province_name', $this, 'ajax_check_province_name');
    }

    /**
     * Handle AJAX request untuk mengecek ketersediaan nama provinsi
     */
    public function ajax_check_province_name() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $current_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if (empty($name)) {
            wp_send_json_error(array(
                'message' => 'Nama provinsi tidak boleh kosong'
            ));
        }

        try {
            // Check apakah nama sudah ada di database
            $exists = $this->model->get_by_name($name, $current_id);
            
            if ($exists) {
                wp_send_json_error(array(
                    'message' => 'Nama provinsi sudah digunakan'
                ));
            }

            wp_send_json_success(array(
                'message' => 'Nama provinsi tersedia'
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_scripts($hook) {
            if (strpos($hook, 'indonesia-regions') === false) {
                return;
            }

            $version = $this->get_version();

            // Enqueue vendor scripts first
            wp_enqueue_script(
                'datatables',
                'https://cdn.datatables.net/1.10.24/js/jquery.dataTables.js',
                array('jquery'),
                '1.10.24',
                true
            );

            // Core config files
            wp_enqueue_script(
                'ir-constants',
                IR_PLUGIN_URL . 'assets/js/admin/config/constants.js',
                array('jquery'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-settings',
                IR_PLUGIN_URL . 'assets/js/admin/config/settings.js',
                array('jquery', 'ir-constants'),
                $version,
                true
            );

            // Base modules
            wp_enqueue_script(
                'ir-helper',
                IR_PLUGIN_URL . 'assets/js/admin/modules/helper.js',
                array('jquery', 'ir-settings'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-cache',
                IR_PLUGIN_URL . 'assets/js/admin/modules/cache.js',
                array('jquery', 'ir-settings'),
                $version,
                true
            );

            // Base components
            wp_enqueue_script(
                'ir-toast',
                IR_PLUGIN_URL . 'assets/js/admin/components/toast.js',
                array('jquery', 'ir-helper', 'ir-settings'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-modal-base',
                IR_PLUGIN_URL . 'assets/js/admin/components/modal/base.js',
                array('jquery', 'ir-helper'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-validator',
                IR_PLUGIN_URL . 'assets/js/admin/modules/validator.js',
                array('jquery', 'ir-settings', 'ir-toast'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-api',
                IR_PLUGIN_URL . 'assets/js/admin/modules/api.js',
                array('jquery', 'ir-settings', 'ir-cache', 'ir-toast'),
                $version,
                true
            );

            // Extended components
            wp_enqueue_script(
                'ir-modal-form',
                IR_PLUGIN_URL . 'assets/js/admin/components/modal/form.js',
                array('jquery', 'ir-modal-base', 'ir-validator', 'ir-helper'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-table-base',
                IR_PLUGIN_URL . 'assets/js/admin/components/table/base.js',
                array('jquery', 'datatables', 'ir-helper'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-table-actions',
                IR_PLUGIN_URL . 'assets/js/admin/components/table/actions.js',
                array('jquery', 'ir-table-base'),
                $version,
                true
            );

            wp_enqueue_script(
                'ir-detail-panel',
                IR_PLUGIN_URL . 'assets/js/admin/components/detail-panel.js',
                array('jquery', 'ir-helper', 'ir-toast'),
                $version,
                true
            );

            // Province feature files
            $province_dependencies = array(
                'jquery',
                'ir-modal-form',
                'ir-table-base',
                'ir-table-actions',
                'ir-detail-panel',
                'ir-api',
                'ir-toast'
            );

            wp_enqueue_script(
                'ir-province-create',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/create.js',
                $province_dependencies,
                $version,
                true
            );

            wp_enqueue_script(
                'ir-province-update',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/update.js',
                $province_dependencies,
                $version,
                true
            );

            wp_enqueue_script(
                'ir-province-delete',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/delete.js',
                $province_dependencies,
                $version,
                true
            );

            wp_enqueue_script(
                'ir-province-table',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/table.js',
                $province_dependencies,
                $version,
                true
            );

            wp_enqueue_script(
                'ir-province-detail',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/detail.js',
                $province_dependencies,
                $version,
                true
            );

            wp_enqueue_script(
                'ir-province-index',
                IR_PLUGIN_URL . 'assets/js/admin/features/province/index.js',
                array_merge($province_dependencies, array(
                    'ir-province-create',
                    'ir-province-update',
                    'ir-province-delete',
                    'ir-province-table',
                    'ir-province-detail'
                )),
                $version,
                true
            );

            // Main app
            wp_enqueue_script(
                'ir-app',
                IR_PLUGIN_URL . 'assets/js/admin/app.js',
                array('ir-province-index'),
                $version,
                true
            );

            // Localize script
            wp_localize_script('ir-settings', 'irSettings', array(
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('ir_nonce'),
                'messages' => array(
                    'confirmDelete' => __('Apakah Anda yakin ingin menghapus provinsi ini?'),
                    'errorLoading' => __('Gagal memuat data'),
                    'errorSaving' => __('Gagal menyimpan data'),
                    'duplicateName' => __('Nama provinsi sudah ada')
                )
            ));
        }
    /**
     * Enqueue admin styles
     */
    public function enqueue_styles($hook) {
        if (strpos($hook, 'indonesia-regions') === false) {
            return;
        }

        wp_enqueue_style(
            'datatables',
            'https://cdn.datatables.net/1.10.24/css/jquery.dataTables.css',
            array(),
            '1.10.24'
        );

        wp_enqueue_style(
            'ir-admin',
            IR_PLUGIN_URL . 'assets/css/admin/style.css',
            array(),
            IR_VERSION
        );
    }

    /**
     * Handle AJAX request to get provinces for DataTables
     */
    public function ajax_get_provinces() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $draw = isset($_POST['draw']) ? intval($_POST['draw']) : 1;
        $start = isset($_POST['start']) ? intval($_POST['start']) : 0;
        $length = isset($_POST['length']) ? intval($_POST['length']) : 10;
        $search = isset($_POST['search']['value']) ? sanitize_text_field($_POST['search']['value']) : '';
        $order_column = isset($_POST['order'][0]['column']) ? intval($_POST['order'][0]['column']) : 1;
        $order_dir = isset($_POST['order'][0]['dir']) ? sanitize_text_field($_POST['order'][0]['dir']) : 'ASC';

        // Map DataTables column index to database column name
        $columns = array(
            0 => 'id',
            1 => 'name',
            2 => 'total_cities',
            3 => 'created_at'
        );

        $order_by = isset($columns[$order_column]) ? $columns[$order_column] : 'name';

        try {
            $provinces = $this->model->get_all($search, $order_by, $order_dir, $length, $start);
            $total = $this->model->get_total($search);

            wp_send_json(array(
                'draw' => $draw,
                'recordsTotal' => $total,
                'recordsFiltered' => $total,
                'data' => $provinces
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request to get single province detail
     */
    public function ajax_get_province() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if (!$id) {
            wp_send_json_error(array(
                'message' => 'ID provinsi tidak valid'
            ));
        }

        try {
            $province = $this->model->get($id);
            
            if (!$province) {
                wp_send_json_error(array(
                    'message' => 'Provinsi tidak ditemukan'
                ), 404);
            }

            wp_send_json_success($province);

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request to create new province
     */
    public function ajax_create_province() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        
        if (empty($name)) {
            wp_send_json_error(array(
                'field' => 'provinceName',
                'message' => 'Nama provinsi tidak boleh kosong'
            ));
        }

        try {
            $result = $this->model->create($name);
            
            if (is_wp_error($result)) {
                wp_send_json_error(array(
                    'field' => 'provinceName',
                    'message' => $result->get_error_message()
                ));
            }

            wp_send_json_success(array(
                'id' => $result,
                'message' => 'Provinsi berhasil ditambahkan'
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request to update province
     */
    public function ajax_update_province() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        
        if (!$id || empty($name)) {
            wp_send_json_error(array(
                'field' => empty($name) ? 'provinceName' : '',
                'message' => empty($name) ? 'Nama provinsi tidak boleh kosong' : 'ID provinsi tidak valid'
            ));
        }

        try {
            $result = $this->model->update($id, $name);
            
            if (is_wp_error($result)) {
                wp_send_json_error(array(
                    'field' => 'provinceName',
                    'message' => $result->get_error_message()
                ));
            }

            wp_send_json_success(array(
                'message' => 'Provinsi berhasil diupdate'
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request to delete province
     */
    public function ajax_delete_province() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if (!$id) {
            wp_send_json_error(array(
                'message' => 'ID provinsi tidak valid'
            ));
        }

        try {
            $result = $this->model->delete($id);
            
            if ($result === false) {
                throw new \Exception('Gagal menghapus provinsi');
            }

            wp_send_json_success(array(
                'message' => 'Provinsi berhasil dihapus'
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Cache buster for development
     */
    private function get_version() {
        return defined('WP_DEBUG') && WP_DEBUG ? time() : IR_VERSION;
    }

}