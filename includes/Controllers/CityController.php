<?php
namespace IndonesiaRegions\Controllers;

class CityController {
    private $model;
    private $loader;
    
    public function __construct() {
        $this->model = new \IndonesiaRegions\Models\City();
    }

    /**
     * Set loader instance
     */
    public function set_loader($loader) {
        $this->loader = $loader;
        $this->define_admin_hooks();
    }

    /**
     * Define admin hooks khusus untuk City
     */
    private function define_admin_hooks() {
        // AJAX hooks untuk cities
        $this->loader->add_action('wp_ajax_ir_city_get_all', $this, 'ajax_get_all');
        $this->loader->add_action('wp_ajax_ir_city_get', $this, 'ajax_get');
        $this->loader->add_action('wp_ajax_ir_city_create', $this, 'ajax_create');
        $this->loader->add_action('wp_ajax_ir_city_update', $this, 'ajax_update');
        $this->loader->add_action('wp_ajax_ir_city_delete', $this, 'ajax_delete');
        $this->loader->add_action('wp_ajax_ir_city_check_name', $this, 'ajax_check_name');
    }

    /**
     * Handle AJAX request untuk get all cities
     */
    public function ajax_get_all() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $province_id = isset($_POST['province_id']) ? intval($_POST['province_id']) : 0;
        if (!$province_id) {
            wp_send_json_error(array('message' => 'ID provinsi tidak valid'));
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
            2 => 'type',
            3 => 'created_at'
        );

        $order_by = isset($columns[$order_column]) ? $columns[$order_column] : 'name';

        try {
            $cities = $this->model->get_all(
                $province_id, 
                $search, 
                $order_by, 
                $order_dir, 
                $length, 
                $start
            );
            
            $total = $this->model->get_total($province_id, $search);

            wp_send_json(array(
                'draw' => $draw,
                'recordsTotal' => $total,
                'recordsFiltered' => $total,
                'data' => $cities
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request untuk get single city
     */
    public function ajax_get() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if (!$id) {
            wp_send_json_error(array('message' => 'ID tidak valid'));
        }

        try {
            $city = $this->model->get($id);
            
            if (!$city) {
                wp_send_json_error(array(
                    'message' => 'Data tidak ditemukan'
                ), 404);
            }

            wp_send_json_success($city);

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle AJAX request untuk create new city
     */
    public function ajax_create() {
        try {
            if (!check_ajax_referer('ir_nonce', 'nonce', false)) {
                wp_send_json_error(array(
                    'message' => 'Invalid security token'
                ), 403);
            }
            
            if (!current_user_can('manage_options')) {
                wp_send_json_error(array(
                    'message' => 'Unauthorized'
                ), 403);
            }

            // Get and validate data
            $province_id = isset($_POST['province_id']) ? intval($_POST['province_id']) : 0;
            $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
            $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';
            
            if (!$province_id) {
                wp_send_json_error(array(
                    'field' => 'province_id',
                    'message' => 'ID provinsi tidak valid'
                ), 400);
            }

            if (empty($name)) {
                wp_send_json_error(array(
                    'field' => 'cityName',
                    'message' => 'Nama kota/kabupaten tidak boleh kosong'
                ), 400);
            }

            if (empty($type)) {
                wp_send_json_error(array(
                    'field' => 'cityType',
                    'message' => 'Tipe harus dipilih'
                ), 400);
            }

            // Create city
            $result = $this->model->create(array(
                'province_id' => $province_id,
                'name' => $name,
                'type' => $type
            ));
            
            if (is_wp_error($result)) {
                wp_send_json_error(array(
                    'field' => 'cityName',
                    'message' => $result->get_error_message()
                ), 400);
            }

            // Success response
            wp_send_json_success(array(
                'id' => $result,
                'message' => 'Kabupaten/Kota berhasil ditambahkan'
            ));

        } catch (Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ), 500);
        }
    }

    /**
     * Handle AJAX request untuk check city name
     */
    public function ajax_check_name() {
        check_ajax_referer('ir_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'), 403);
        }

        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $province_id = isset($_POST['province_id']) ? intval($_POST['province_id']) : 0;
        $current_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if (empty($name) || !$province_id) {
            wp_send_json_error(array(
                'message' => 'Data tidak lengkap'
            ));
        }

        try {
            // Check if name exists in the same province
            $exists = $this->model->name_exists($name, $province_id, $current_id);
            
            if ($exists) {
                wp_send_json_error(array(
                    'message' => 'Nama kabupaten/kota sudah ada di provinsi ini'
                ));
            }

            wp_send_json_success(array(
                'message' => 'Nama kabupaten/kota tersedia'
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }
}