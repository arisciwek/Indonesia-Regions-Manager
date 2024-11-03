# Indonesia Regions WordPress Plugin Structure

## Root Directory
- `indonesia-regions.php`
  - Main plugin file
  - Contains plugin initialization, constants definition, autoloader setup
  - Registers activation and deactivation hooks

## /includes Directory

### /Core
- `/includes/Core/Activator.php`
  - Handles plugin activation
  - Creates necessary database tables (provinces and cities)
  - Sets up initial plugin options
  - Flushes rewrite rules

- `/includes/Core/Deactivator.php`
  - Handles plugin deactivation
  - Cleans up scheduled hooks
  - Optionally removes plugin data and tables
  - Flushes rewrite rules

- `/includes/Core/Loader.php`
  - Manages WordPress action and filter hooks
  - Provides methods to register and execute hooks
  - Central registry for all plugin hooks

- `/includes/Core/Plugin.php`
  - Main plugin orchestrator
  - Initializes plugin components
  - Defines admin and public hooks
  - Manages plugin version and slug

### /Controllers
- `/includes/Controllers/ProvinceController.php`
  - Handles province-related admin functionality
  - Manages AJAX requests for provinces CRUD operations
  - Registers admin menu and enqueues assets
  - Renders admin pages and handles form submissions

### /Models
- `/includes/Models/Province.php`
  - Database interaction for provinces
  - CRUD operations for provinces table
  - Handles province-city relationships
  - Includes validation and error handling

### /Views/admin/provinces
- `/includes/Views/admin/provinces/list.php`
  - Template for provinces listing page
  - Contains DataTables initialization
  - Includes add/edit province modal form

- `/includes/Views/admin/provinces/detail.php`
  - Template for province detail view
  - Shows province statistics and related cities
  - Contains edit/delete province actions

## /assets Directory

### /js/admin
- `/assets/js/admin/FormValidator.js`
  - Client-side form validation
  - Handles name validation rules
  - Provides duplicate name checking
  - Manages validation messages

- `/assets/js/admin/main.js`
  - Main admin JavaScript functionality
  - Manages province CRUD operations
  - Handles UI interactions and state
  - Implements DataTables integration

### /css/admin
- `/assets/css/admin/style.css`
  - Admin interface styling
  - Defines layout and component styles
  - Handles responsive design
  - Includes modal, form, and table styling

## File Organization Summary
The plugin follows a modular MVC-like structure:
- Core files handle plugin lifecycle and infrastructure
- Controllers manage admin interfaces and AJAX requests
- Models handle database operations and business logic
- Views contain template files for the admin interface
- Assets contain JavaScript and CSS files for the admin area

Each file has a specific responsibility and works together to provide a complete province management system for Indonesian regions.
