admin-js-architecture.md


assets/
└── js/
    └── admin/
        ├── modules/              # Shared modules/utilities
        │   ├── cache.js         # Cache handling
        │   ├── validator.js     # Form validation rules
        │   ├── api.js          # AJAX request handling
        │   └── helper.js       # Helper functions
        │
        ├── components/          # Reusable UI Components
        │   ├── modal/
        │   │   ├── base.js     # Base modal functionality
        │   │   └── form.js     # Form modal extension
        │   ├── table/
        │   │   ├── base.js     # Base DataTable setup
        │   │   └── actions.js  # Common table actions
        │   ├── toast.js        # Toast notifications
        │   └── detail-panel.js # Detail panel behavior
        │
        ├── features/           # Business features
        │   ├── province/       # Province management
        │   │   ├── create.js   # Province creation
        │   │   ├── update.js   # Province updates
        │   │   ├── delete.js   # Province deletion
        │   │   ├── table.js    # Province table handling
        │   │   ├── detail.js   # Province detail view
        │   │   └── index.js    # Province initialization
        │   │
        │   └── city/          # City management (future)
        │       ├── create.js   # City creation
        │       ├── update.js   # City updates
        │       ├── delete.js   # City deletion
        │       ├── table.js    # City table handling
        │       ├── detail.js   # City detail view
        │       └── index.js    # City initialization
        │
        ├── config/
        │   ├── constants.js    # App constants
        │   └── settings.js     # App settings
        │
        └── app.js             # Main initialization