(function($) {
    'use strict';

    // Cache object untuk menyimpan hasil AJAX
    const cache = {
        provinces: {},
        cities: {},
        clearCache: function() {
            this.provinces = {};
            this.cities = {};
        }
    };

    // Class utama untuk mengelola Provinsi
    class ProvinceManager {
        constructor() {
            this.validator = new FormValidator();
            this.initializeVariables();
            this.initializeEventListeners();
            this.initializeFormValidation();
            this.initializeDatatables();
            this.handleURLHash();
        }

        initializeVariables() {
            // DOM Elements - Modal
            this.$modal = $('#provinceModal');
            this.$form = $('#provinceForm');
            this.$nameInput = $('#provinceName');
            this.$idInput = $('#provinceId');
            
            // DOM Elements - Panels
            this.$provincesList = $('#provincesList');
            this.$provinceDetail = $('#provinceDetail');
            this.$provinceDetailLoading = $('#provinceDetailLoading');
            this.$mainContent = $('.ir-provinces');
            this.$detailContent = $('.ir-provinces-detail');
            
            // State
            this.currentProvinceId = null;
            this.isEditing = false;

            // Ensure both views exist
            if (!this.$detailContent.length) {
                this.$detailContent = $('<div class="ir-provinces-detail">').hide();
                this.$mainContent.after(this.$detailContent);
            }
        }

        initializeFormValidation() {
            // Real-time validation saat input
            this.$nameInput.on('input', async (e) => {
                const value = e.target.value;
                
                // Basic validation
                const result = this.validator.validateField('name', value);
                
                if (!result.valid) {
                    this.showError('provinceName', result.message);
                    return;
                }

                // Check duplicate after basic validation passes
                if (value.trim().length >= 3) {
                    const dupeCheck = await this.validator.checkDuplicate(value);
                    if (!dupeCheck.valid) {
                        this.showError('provinceName', dupeCheck.message);
                        return;
                    }
                }

                // Clear error if all validations pass
                this.clearErrors();
            });
        }

        initializeEventListeners() {
            // Modal events
            $('#btnAddProvince').on('click', () => this.showModal());
            $('.ir-modal-close, #btnCancelProvince').on('click', () => this.hideModal());
            $('#btnSaveProvince').on('click', () => this.saveProvince());
            
            // Province list events
            this.$provincesList.on('click', 'li', (e) => {
                const provinceId = $(e.currentTarget).data('id');
                this.loadProvinceDetail(provinceId);
            });

            // Detail page events
            $('#btnEditProvince').on('click', () => this.editCurrentProvince());
            $('#btnDeleteProvince').on('click', () => this.deleteCurrentProvince());

            // Handle form submit (untuk Enter key)
            this.$form.on('submit', (e) => {
                e.preventDefault();
                this.saveProvince();
            });

            // Handle form input keypress
            this.$form.on('keypress', (e) => {
                // Jika tombol Enter ditekan
                if (e.which === 13) {
                    e.preventDefault();
                    this.saveProvince();
                }
            });

            // Handle browser back/forward
            $(window).on('hashchange', () => this.handleURLHash());
        }

        initializeDatatables() {
            // Initialize main provinces table
            this.provincesTable = $('#provincesTable').DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: (d) => {
                        return {
                            ...d,
                            action: 'ir_get_provinces',
                            nonce: irSettings.nonce
                        };
                    }
                },
                columns: [
                    { data: 'id' },
                    { 
                        data: 'name',
                        render: (data, type, row) => {
                            if (type === 'display') {
                                return `<a href="#${row.id}" class="province-link">${data}</a>`;
                            }
                            return data;
                        }
                    },
                    { 
                        data: 'total_cities',
                        searchable: false
                    },
                    { 
                        data: 'created_at',
                        render: (data) => {
                            return new Date(data).toLocaleDateString('id-ID');
                        }
                    },
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: (data) => {
                            return `
                                <button type="button" class="button button-small edit-province" data-id="${data.id}">
                                    Edit
                                </button>
                                <button type="button" class="button button-small button-link-delete delete-province" data-id="${data.id}">
                                    Hapus
                                </button>
                            `;
                        }
                    }
                ],
                order: [[1, 'asc']],
                initComplete: (settings, json) => {
                    // Add individual column searching
                    this.provincesTable.columns().every(function() {
                        const column = this;
                        $('input', this.footer()).on('keyup change', function() {
                            if (column.search() !== this.value) {
                                column.search(this.value).draw();
                            }
                        });
                    });
                }
            });

            // Handle province link clicks
            $('#provincesTable').on('click', '.province-link', (e) => {
                e.preventDefault();
                const href = $(e.currentTarget).attr('href');
                window.location.hash = href.replace('#', '');
            });

            // Handle edit button clicks
            $('#provincesTable').on('click', '.edit-province', (e) => {
                e.preventDefault();
                const provinceId = $(e.currentTarget).data('id');
                this.editProvince(provinceId);
            });

            // Handle delete button clicks
            $('#provincesTable').on('click', '.delete-province', (e) => {
                e.preventDefault();
                const provinceId = $(e.currentTarget).data('id');
                this.deleteProvince(provinceId);
            });
        }

        handleURLHash() {
            const hash = window.location.hash;
            if (hash) {
                const provinceId = parseInt(hash.replace('#', ''));
                if (provinceId) {
                    // Show detail view alongside main content
                    this.$detailContent.addClass('active').show();
                    this.loadProvinceDetail(provinceId);
                }
            } else {
                // Hide detail view only
                this.$detailContent.removeClass('active').hide();
                this.$provinceDetail.hide();
                this.$provinceDetailLoading.hide();
                this.currentProvinceId = null;
            }
        }

        showModal(provinceData = null) {
            this.isEditing = !!provinceData;
            this.$modal.find('.ir-modal-header h2').text(
                this.isEditing ? 'Edit Provinsi' : 'Tambah Provinsi'
            );
            
            if (provinceData) {
                this.$nameInput.val(provinceData.name);
                this.$idInput.val(provinceData.id);
            } else {
                this.$form[0].reset();
                this.$idInput.val('');
            }

            this.$modal.show();
            this.$nameInput.focus();
        }

        hideModal() {
            this.$modal.hide();
            this.$form[0].reset();
            this.clearErrors();
        }

        clearErrors() {
            this.$form.find('.ir-error-message').hide().text('');
            this.$form.find('.error').removeClass('error');
        }

        showError(field, message) {
            const $field = this.$form.find(`#${field}`);
            const $error = $field.siblings('.ir-error-message');
            $field.addClass('error');
            $error.text(message).show();
        }

        async saveProvince() {
           this.clearErrors();
           // Validate before save
           const value = this.$nameInput.val();
           
           // Basic validation dulu
           const result = this.validator.validateField('name', value);
           if (!result.valid) {
               this.showError('provinceName', result.message);
               return; // Stop jika basic validation gagal
           }
           // Check duplicate
           const dupeCheck = await this.validator.checkDuplicate(value);
           if (!dupeCheck.valid) {
               this.showError('provinceName', dupeCheck.message);
               return; // Stop jika duplicate
           }
           // Jika semua validasi pass, lanjut save
           const formData = new FormData(this.$form[0]);
           formData.append('action', this.isEditing ? 'ir_update_province' : 'ir_create_province');
           formData.append('nonce', irSettings.nonce);
           try {
               const response = await $.ajax({
                   url: irSettings.ajaxurl,
                   type: 'POST',
                   data: formData,
                   processData: false,
                   contentType: false
               });
               if (response.success) {
                   this.showToast('Provinsi berhasil disimpan', 'success');
                   this.hideModal();
                   
                   // Clear cache for this province
                   const editedId = this.isEditing ? formData.get('id') : response.data.id;
                   if (editedId) {
                       cache.provinces[editedId] = null;
                       // Reload DataTables
                       this.provincesTable.ajax.reload(null, false);
                       // Update URL and reload detail data
                       window.location.hash = editedId;
                       await this.loadProvinceDetail(editedId);  // Load ulang detail
                   }
               } else {
                   if (response.data.field) {
                       this.showError(response.data.field, response.data.message);
                   } else {
                       this.showToast(response.data.message || 'Gagal menyimpan data', 'error');
                   }
               }
           } catch (error) {
               console.error('Save error:', error);
               this.showToast('Terjadi kesalahan sistem', 'error');
           }
        }
        
        async loadProvinceDetail(provinceId) {
            if (!provinceId) return;
            
            this.currentProvinceId = provinceId;
            this.$provinceDetail.hide();
            this.$provinceDetailLoading.show();

            try {
                let data;
                // Clear cache for this province to ensure fresh data
                cache.provinces[provinceId] = null;
                
                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ir_get_province',
                        id: provinceId,
                        nonce: irSettings.nonce
                    }
                });
                
                if (response.success) {
                    data = response.data;
                    cache.provinces[provinceId] = data;
                    this.updateProvinceDetail(data);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                this.showToast('Gagal memuat detail provinsi', 'error');
            } finally {
                this.$provinceDetailLoading.hide();
                this.$provinceDetail.show();
            }
        }

        updateProvinceDetail(data) {
            // Update panel header dengan nama provinsi
            $('#provinceDetailName').text(data.name);
            
            // Update stats
            $('#totalCities').text(data.total_cities);
            $('#createdAt').text(new Date(data.created_at).toLocaleDateString('id-ID'));
            $('#updatedAt').text(new Date(data.updated_at).toLocaleDateString('id-ID'));
        }

        editProvince(provinceId) {
            const data = cache.provinces[provinceId];
            if (data) {
                this.showModal(data);
            } else {
                $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ir_get_province',
                        id: provinceId,
                        nonce: irSettings.nonce
                    },
                    success: (response) => {
                        if (response.success) {
                            cache.provinces[provinceId] = response.data;
                            this.showModal(response.data);
                        } else {
                            this.showToast('Data provinsi tidak ditemukan', 'error');
                        }
                    },
                    error: () => {
                        this.showToast('Gagal memuat data provinsi', 'error');
                    }
                });
            }
        }

        async deleteProvince(provinceId) {
            if (!confirm(irSettings.messages.confirmDelete)) return;

            try {
                const response = await $.ajax({
                    url: irSettings.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'ir_delete_province',
                        id: provinceId,
                        nonce: irSettings.nonce
                    }
                });

                if (response.success) {
                    this.showToast('Provinsi berhasil dihapus', 'success');
                    this.provincesTable.ajax.reload();
                    
                    // Clear hash if deleted province is currently shown
                    if (this.currentProvinceId === provinceId) {
                        window.location.hash = '';
                    }
                    
                    cache.clearCache();
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                this.showToast('Gagal menghapus provinsi', 'error');
            }
        }

        editCurrentProvince() {
            if (!this.currentProvinceId) return;
            this.editProvince(this.currentProvinceId);
        }

        deleteCurrentProvince() {
            if (!this.currentProvinceId) return;
            this.deleteProvince(this.currentProvinceId);
        }

        showToast(message, type = 'success') {
            const $toast = $('<div>')
                .addClass(`ir-toast ${type}`)
                .text(message)
                .appendTo('body')
                .fadeIn();

            setTimeout(() => {
                $toast.fadeOut(() => $toast.remove());
            }, 3000);
        }
    }

    // Initialize when document is ready
    $(document).ready(() => {
        new ProvinceManager();
    });

})(jQuery);