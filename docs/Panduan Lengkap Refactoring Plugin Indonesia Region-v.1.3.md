# Perubahan Penamaan File Plugin Indonesia Region
Version: 1.3
Last Updated: 2024-11-19 15:30:00

## Changelog:
v1.3 (2024-11-19):
- Added complete file mapping between old and new names
- Added dependency check requirements
- Added file renaming procedure
- Added rollback procedure

v1.2 (2024-11-19):
- Added fourth source of province ID
- Enhanced error handling

v1.1 (2024-11-17):
- Initial version

## A. File Mapping (Old → New)

### CSS Files:
```
assets/css/admin/
- style.css → provinces-manager.css
- components/detail-tabs.css → components/province-detail-tabs.css
+ components/province-table.css (NEW)
```

### JavaScript Config Files:
```
assets/js/admin/config/
- constants.js → provinces-constants.js
- settings.js → provinces-settings.js
```

### JavaScript Core Files:
```
assets/js/admin/
- app.js → provinces-manager-app.js
```

### JavaScript Modules:
```
assets/js/admin/modules/
- api.js → provinces-api.js
- cache.js → provinces-cache.js
- helper.js → provinces-helper.js
- validator.js → provinces-validator.js
```

### JavaScript Components:
```
assets/js/admin/components/
modal/
- base.js → province-modal-base.js
- form.js → province-modal-form.js

table/
- base.js → province-table-base.js
- actions.js → province-table-actions.js

- toast.js → province-toast.js
- detail-panel.js → province-detail-panel.js
```

### JavaScript Features:
```
assets/js/admin/features/province/
- index.js → province-manager.js
- table.js → province-table.js
- create.js → province-create.js
- update.js → province-update.js
- delete.js → province-delete.js
- detail.js → province-detail.js
```

## B. Required Updates in Files

### 1. PHP File Updates
```php
// ProvinceController.php
public function enqueue_scripts($hook) {
    // Update all wp_enqueue_script calls with new filenames
    wp_enqueue_script(
        'ir-provinces-manager',
        IR_PLUGIN_URL . 'assets/js/admin/provinces-manager-app.js',
        array('jquery'),
        $version,
        true
    );
    // ... update all other enqueue calls
}

public function enqueue_styles($hook) {
    // Update wp_enqueue_style calls
    wp_enqueue_style(
        'ir-provinces-manager',
        IR_PLUGIN_URL . 'assets/css/admin/provinces-manager.css',
        array(),
        IR_VERSION
    );
}
```

### 2. JavaScript Import Updates
```javascript
// In provinces-manager-app.js
import { ProvinceConstants } from './config/provinces-constants';
import { ProvinceSettings } from './config/provinces-settings';
// ... update all other imports
```

### 3. CSS Import Updates
```css
/* In provinces-manager.css */
@import 'components/province-detail-tabs.css';
@import 'components/province-table.css';
```

## C. Implementation Procedure

### Phase 1: Preparation
1. Create complete backup of current files
2. Create dependency map of all files
3. Set up test environment
4. Create rollback script

### Phase 2: File Renaming
1. Create new files with new names
2. Copy content from old to new files
3. Update all import/require paths
4. Update all enqueue calls

### Phase 3: Testing
1. Test in development environment
2. Verify all features work
3. Check browser console for errors
4. Test all CRUD operations
5. Verify asset loading

### Phase 4: Deployment
1. Deploy to staging
2. Comprehensive testing
3. Deploy to production
4. Keep old files for 1 release cycle
5. Remove old files after verification

## D. Rollback Procedure

### Immediate Rollback:
1. Restore original files from backup
2. Revert enqueue changes in PHP
3. Clear browser caches
4. Clear server caches
5. Verify functionality

### Gradual Rollback:
1. Keep both old and new files
2. Switch back to old files in PHP
3. Monitor for issues
4. Remove new files if needed

## E. Versioning Updates

Update version numbers in:
1. plugin main file (indonesia-regions.php)
2. README.md
3. changelog.md
4. All affected PHP, JS, and CSS files

```php
// indonesia-regions.php
define('IR_VERSION', '1.3.0');
```

## F. Post-Implementation Verification

1. Check all features:
   - Province CRUD operations
   - Detail panel functionality
   - Table operations
   - Modal operations
   - Error handling
   - Cache operations

2. Verify asset loading:
   - Check network tab for 404s
   - Verify script loading order
   - Check for console errors
   - Verify CSS application

3. Performance checks:
   - Page load time
   - Asset load time
   - Cache effectiveness
   - Memory usage

## Dependencies:
- Previous Version: v1.2
- Related Docs: 
  - /docs/tech-spec-v1.3.md
  - /docs/deploy-v1.3.md
  - /docs/rollback-v1.3.md


