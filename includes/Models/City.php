<?php
namespace IndonesiaRegions\Models;

class City {
    private $wpdb;
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'cities';
    }

    /**
     * Get all cities dengan filter dan pagination
     */
    public function get_all($province_id, $search = '', $order_by = 'name', $order = 'ASC', $limit = 10, $offset = 0) {
        $where = array();
        $params = array();

        // Filter by province
        $where[] = 'province_id = %d';
        $params[] = $province_id;

        // Search filter
        if (!empty($search)) {
            $where[] = 'name LIKE %s';
            $params[] = '%' . $this->wpdb->esc_like($search) . '%';
        }

        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Build query
        $sql = $this->wpdb->prepare(
            "SELECT * FROM {$this->table_name} 
            {$where_clause}
            ORDER BY {$order_by} {$order}
            LIMIT %d OFFSET %d",
            array_merge($params, array($limit, $offset))
        );

        return $this->wpdb->get_results($sql);
    }

    /**
     * Get total records dengan filter
     */
    public function get_total($province_id, $search = '') {
        $where = array();
        $params = array();

        // Filter by province
        $where[] = 'province_id = %d';
        $params[] = $province_id;

        // Search filter
        if (!empty($search)) {
            $where[] = 'name LIKE %s';
            $params[] = '%' . $this->wpdb->esc_like($search) . '%';
        }

        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        // Build query
        $sql = $this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->table_name} {$where_clause}",
            $params
        );

        return $this->wpdb->get_var($sql);
    }

    /**
     * Get single city by ID
     */
    public function get($id) {
        return $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE id = %d",
                $id
            )
        );
    }

    /**
     * Check if name exists in the same province
     */
    public function name_exists($name, $province_id, $exclude_id = 0) {
        $sql = $this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->table_name} 
            WHERE name = %s AND province_id = %d",
            $name,
            $province_id
        );

        if ($exclude_id > 0) {
            $sql .= $this->wpdb->prepare(" AND id != %d", $exclude_id);
        }

        return (bool) $this->wpdb->get_var($sql);
    }

    /**
     * Create new city
     */
    public function create($data) {
        // Validate required fields
        if (empty($data['name']) || empty($data['province_id']) || empty($data['type'])) {
            return new \WP_Error('missing_required', 'Semua field harus diisi');
        }

        // Check if name exists in the same province
        if ($this->name_exists($data['name'], $data['province_id'])) {
            return new \WP_Error('duplicate_name', 'Nama kota/kabupaten sudah ada di provinsi ini');
        }

        // Validate type
        if (!in_array($data['type'], array('kabupaten', 'kota'))) {
            return new \WP_Error('invalid_type', 'Tipe harus kabupaten atau kota');
        }

        $result = $this->wpdb->insert(
            $this->table_name,
            array(
                'province_id' => $data['province_id'],
                'name' => $data['name'],
                'type' => $data['type']
            ),
            array('%d', '%s', '%s')
        );

        if ($result === false) {
            return new \WP_Error('db_error', 'Gagal menyimpan data');
        }

        return $this->wpdb->insert_id;
    }

    /**
     * Update existing city
     */
    public function update($id, $data) {
        // Validate required fields
        if (empty($data['name']) || empty($data['type'])) {
            return new \WP_Error('missing_required', 'Semua field harus diisi');
        }

        // Get current data
        $current = $this->get($id);
        if (!$current) {
            return new \WP_Error('not_found', 'Data tidak ditemukan');
        }

        // Check if name exists in the same province
        if ($this->name_exists($data['name'], $current->province_id, $id)) {
            return new \WP_Error('duplicate_name', 'Nama kota/kabupaten sudah ada di provinsi ini');
        }

        // Validate type
        if (!in_array($data['type'], array('kabupaten', 'kota'))) {
            return new \WP_Error('invalid_type', 'Tipe harus kabupaten atau kota');
        }

        $result = $this->wpdb->update(
            $this->table_name,
            array(
                'name' => $data['name'],
                'type' => $data['type']
            ),
            array('id' => $id),
            array('%s', '%s'),
            array('%d')
        );

        if ($result === false) {
            return new \WP_Error('db_error', 'Gagal mengupdate data');
        }

        return true;
    }

    /**
     * Delete city
     */
    public function delete($id) {
        return $this->wpdb->delete(
            $this->table_name,
            array('id' => $id),
            array('%d')
        );
    }

    /**
     * Get cities by province ID
     */
    public function get_by_province($province_id) {
        return $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE province_id = %d ORDER BY name ASC",
                $province_id
            )
        );
    }
}