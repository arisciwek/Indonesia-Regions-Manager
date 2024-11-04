(function($) {
    'use strict';

    // Cache module untuk menyimpan hasil AJAX
    const cache = {
        provinces: {},
        cities: {},
        clearCache: function() {
            this.provinces = {};
            this.cities = {};
        },
        // Menambahkan method untuk mengecek dan menyimpan cache
        get: function(key, id) {
            const storage = this[key];
            return storage && storage[id] ? storage[id] : null;
        },
        set: function(key, id, data) {
            if (!this[key]) {
                this[key] = {};
            }
            this[key][id] = data;
        },
        remove: function(key, id) {
            if (this[key] && this[key][id]) {
                delete this[key][id];
            }
        }
    };

    // Export cache module
    window.irCache = cache;

})(jQuery);
