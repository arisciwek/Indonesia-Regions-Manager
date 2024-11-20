.
├── assets
│├── css
││└── admin
││    ├── components
││    │└── detail-tabs.css
││    └── style.css
│└── js
│    └── admin
│        ├── app.js
│        ├── components
│        │├── detail-panel.js
│        │├── modal
│        ││├── base.js
│        ││└── form.js
│        │├── table
│        ││├── actions.js
│        ││└── base.js
│        │└── toast.js
│        ├── config
│        │├── constants.js
│        │└── settings.js
│        ├── features
│        │├── cities
│        ││├── city-create.js
│        ││├── city-delete.js
│        ││├── city-form.js
│        ││├── city-manager.js
│        ││├── city-table.js
│        ││└── city-update.js
│        │└── province
│        │    ├── create.js
│        │    ├── delete.js
│        │    ├── detail.js
│        │    ├── index.js
│        │    ├── table.js
│        │    └── update.js
│        └── modules
│            ├── api.js
│            ├── cache.js
│            ├── helper.js
│            └── validator.js
├── includes
│├── Controllers
││├── CityController.php
││└── ProvinceController.php
│├── Core
││├── Activator.php
││├── Deactivator.php
││├── Loader.php
││└── Plugin.php
│├── Models
││├── City.php
││└── Province.php
│└── Views
│    └── admin
│        ├── cities
│        │└── city-form.php
│        └── provinces
│            ├── detail.php
│            └── list.php
├── indonesia-regions.php
├── README.md
└── tree.md

23 directories, 52 files

Sudah dibuat:
1. assets/js/admin/features/province/index.js
2. assets/js/admin/features/province/create.js
3. assets/js/admin/features/province/detail.js
4. assets/js/admin/features/province/update.js
5. assets/js/admin/features/province/delete.js
6. assets/js/admin/components/modal/form.js
7. assets/js/admin/components/modal/base.js
8. assets/js/admin/components/table/base.js
9. assets/js/admin/components/table/actions.js

Belum dibuat:
1. assets/js/admin/components/detail-panel.js
2. assets/js/admin/components/toast.js
3. assets/js/admin/config/constants.js
4. assets/js/admin/config/settings.js
5. assets/js/admin/modules/api.js
6. assets/js/admin/modules/cache.js
7. assets/js/admin/modules/helper.js
8. assets/js/admin/modules/validator.js
9. assets/js/admin/app.js
10. assets/js/admin/features/province/table.js

Saya lihat bahwa table.js juga perlu dibuat lagi karena ada perbedaan dengan base.js dan perlu disesuaikan dengan pola centralized data management. Mari kita lanjutkan dengan file mana yang ingin Anda prioritaskan?
