<?php
namespace IndonesiaRegions\Models;

class Province {
    private $wpdb;
    private $table_name;
    private $cities_table;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'provinces';
        $this->cities_table = $wpdb->prefix . 'cities';
    }

    public function get_all($search = '', $order_by = 'name', $order = 'ASC', $limit = 10, $offset = 0) {
        $where = '';
        if (!empty($search)) {
            $where = $this->wpdb->prepare("WHERE p.name LIKE %s", '%' . $search . '%');
        }

        // Modified query to include total_cities count
        $sql = "SELECT p.*, 
                COALESCE((
                    SELECT COUNT(*) 
                    FROM {$this->cities_table} c 
                    WHERE c.province_id = p.id
                ), 0) as total_cities 
                FROM {$this->table_name} p 
                {$where} 
                ORDER BY {$order_by} {$order}
                LIMIT %d OFFSET %d";

        return $this->wpdb->get_results(
            $this->wpdb->prepare($sql, $limit, $offset)
        );
    }

    public function get($id) {
        // Modified get method to include total_cities
        return $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT p.*, 
                COALESCE((
                    SELECT COUNT(*) 
                    FROM {$this->cities_table} c 
                    WHERE c.province_id = p.id
                ), 0) as total_cities 
                FROM {$this->table_name} p 
                WHERE p.id = %d",
                $id
            )
        );
    }

    // Rest of the methods remain unchanged
    public function get_total($search = '') {
        $where = '';
        if (!empty($search)) {
            $where = $this->wpdb->prepare("WHERE name LIKE %s", '%' . $search . '%');
        }

        $sql = "SELECT COUNT(*) FROM {$this->table_name} {$where}";
        return $this->wpdb->get_var($sql);
    }

    public function create($name) {
        // Check if name exists
        $exists = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} WHERE name = %s",
                $name
            )
        );

        if ($exists) {
            return new \WP_Error('duplicate_name', 'Nama provinsi sudah ada');
        }

        $result = $this->wpdb->insert(
            $this->table_name,
            array('name' => $name),
            array('%s')
        );

        if ($result === false) {
            return new \WP_Error('db_error', 'Gagal menyimpan data');
        }

        return $this->wpdb->insert_id;
    }

    public function update($id, $name) {
        // Check if name exists for other provinces
        $exists = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->table_name} WHERE name = %s AND id != %d",
                $name,
                $id
            )
        );

        if ($exists) {
            return new \WP_Error('duplicate_name', 'Nama provinsi sudah ada');
        }

        $result = $this->wpdb->update(
            $this->table_name,
            array('name' => $name),
            array('id' => $id),
            array('%s'),
            array('%d')
        );

        if ($result === false) {
            return new \WP_Error('db_error', 'Gagal mengupdate data');
        }

        return true;
    }

    public function delete($id) {
        return $this->wpdb->delete(
            $this->table_name,
            array('id' => $id),
            array('%d')
        );
    }

    public function get_by_name($name, $exclude_id = 0) {
        $sql = $this->wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE name = %s",
            $name
        );
        
        if ($exclude_id > 0) {
            $sql .= $this->wpdb->prepare(" AND id != %d", $exclude_id);
        }
        
        return $this->wpdb->get_row($sql);
    }
}