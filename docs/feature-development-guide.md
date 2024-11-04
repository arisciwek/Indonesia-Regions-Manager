# Feature Development Guide
Guide ini menjelaskan langkah-langkah mengembangkan fitur baru pada Indonesia Regions Plugin dengan menggunakan struktur modular yang ada.

## Table of Contents
- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Development Steps](#development-steps)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Overview
Setiap fitur baru harus mengikuti prinsip-prinsip berikut:
1. Modular dan self-contained
2. Menggunakan shared components yang ada
3. Konsisten dalam penamaan dan struktur
4. Proper error handling dan loading states
5. Menggunakan event system untuk komunikasi antar modul

## Directory Structure
Fitur baru harus mengikuti struktur folder standar:
```
features/
└── your-feature/
    ├── create.js    # Handle creation logic
    ├── update.js    # Handle update logic
    ├── delete.js    # Handle deletion logic
    ├── table.js     # DataTable implementation
    ├── detail.js    # Detail view logic
    └── index.js     # Feature initialization & orchestration
```

## Development Steps

### 1. Backend Preparation
```php
// 1. Buat tabel di Activator.php
$table_name = $wpdb->prefix . 'your_table';
$sql[] = "CREATE TABLE IF NOT EXISTS $table_name (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) $charset_collate;";

// 2. Buat Model class di Models/YourModel.php
class YourModel {
    private $wpdb;
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'your_table';
    }

    // Implement CRUD methods
}

// 3. Buat Controller di Controllers/YourController.php
class YourController {
    private $model;
    
    public function __construct() {
        $this->model = new YourModel();
    }

    // Implement controller methods & AJAX handlers
}
```

### 2. Frontend Implementation

1. **Tambahkan Konstanta**
```javascript
// config/constants.js
EVENTS: {
    YOUR_FEATURE: {
        CREATED: 'your-feature:created',
        UPDATED: 'your-feature:updated',
        DELETED: 'your-feature:deleted',
        LOADED: 'your-feature:loaded'
    }
},
ENDPOINTS: {
    YOUR_FEATURE: {
        LIST: 'ir_get_your_features',
        GET: 'ir_get_your_feature',
        CREATE: 'ir_create_your_feature',
        UPDATE: 'ir_update_your_feature',
        DELETE: 'ir_delete_your_feature'
    }
}
```

2. **Implementasi Fitur Files**

**create.js**:
```javascript
class YourFeatureCreate {
    constructor() {
        this.modal = new irFormModal('yourFeatureModal', {
            onSave: (formData) => this.handleSave(formData),
            validator: (form) => this.validateForm(form)
        });
    }

    async handleSave(formData) {
        try {
            const response = await irAPI.yourFeature.create(formData);
            if (response.success) {
                irToast.success('Data berhasil disimpan');
                this.onSuccess(response.data);
            }
        } catch (error) {
            irToast.error('Gagal menyimpan data');
        }
    }
}
```

**table.js**:
```javascript
class YourFeatureTable extends irBaseTable {
    constructor() {
        super('yourFeatureTable', {
            ajax: {
                url: irSettings.ajaxurl,
                data: (d) => ({
                    ...d,
                    action: irConstants.ENDPOINTS.YOUR_FEATURE.LIST,
                    nonce: irSettings.nonce
                })
            },
            columns: [
                // Define your columns
            ]
        });
    }
}
```

**index.js**:
```javascript
class YourFeatureManager {
    constructor() {
        this.create = new YourFeatureCreate();
        this.update = new YourFeatureUpdate();
        this.delete = new YourFeatureDelete();
        this.table = new YourFeatureTable();
        this.detail = new YourFeatureDetail();

        this.initializeCallbacks();
        this.initializeEvents();
    }

    initializeCallbacks() {
        this.create.onSuccess = (data) => {
            this.table.reload();
            // Additional logic
        };
        // More callbacks
    }
}
```

3. **Update Enqueue Scripts**
```php
// In YourController.php
public function enqueue_scripts($hook) {
    if (strpos($hook, 'your-page') === false) {
        return;
    }

    // Enqueue your feature scripts with proper dependencies
    wp_enqueue_script(
        'ir-your-feature-create',
        IR_PLUGIN_URL . 'assets/js/admin/features/your-feature/create.js',
        array('jquery', 'ir-modal-form', 'ir-api'),
        $version,
        true
    );
    // More enqueue calls
}
```

## Best Practices

### 1. Error Handling
```javascript
try {
    const response = await irAPI.yourFeature.create(data);
    if (!response.success) {
        throw new Error(response.data.message);
    }
    // Handle success
} catch (error) {
    irToast.error('Error message');
    console.error('Operation failed:', error);
}
```

### 2. Loading States
```javascript
async loadData() {
    this.showLoading();
    try {
        // Fetch data
    } catch (error) {
        // Handle error
    } finally {
        this.hideLoading();
    }
}
```

### 3. Cache Management
```javascript
async getData(id) {
    let data = irCache.get('your-feature', id);
    if (!data) {
        const response = await irAPI.yourFeature.get(id);
        data = response.data;
        irCache.set('your-feature', id, data);
    }
    return data;
}
```

### 4. Event Communication
```javascript
// Trigger events
$(document).trigger(irConstants.EVENTS.YOUR_FEATURE.CREATED, [data]);

// Listen for events
$(document).on(irConstants.EVENTS.YOUR_FEATURE.CREATED, (event, data) => {
    // Handle event
});
```

### 5. Reusable Components
```javascript
// Gunakan komponen yang sudah ada
const modal = new irFormModal('modalId', options);
const table = new irBaseTable('tableId', options);
const toast = irToast;
```

## Notes
1. Selalu ikuti struktur naming yang konsisten
2. Dokumentasikan kode dengan jelas
3. Gunakan TypeHints di PHP
4. Validasi input di client dan server side
5. Implementasikan proper security measures (nonce, capability checks, etc)
6. Pertahankan backwards compatibility
7. Test fitur secara menyeluruh sebelum deploy

## Example Implementation
Lihat implementasi Province feature sebagai contoh dan referensi untuk pengembangan fitur baru.
