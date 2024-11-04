(function($) {
    'use strict';

    class DetailPanel {
        constructor(options = {}) {
            this.options = {
                mainContentSelector: '.ir-provinces',
                detailContentSelector: '.ir-provinces-detail',
                loadingSelector: '.ir-loading',
                contentSelector: '.ir-content',
                onLoad: () => {},
                onShow: () => {},
                onHide: () => {},
                ...options
            };

            this.$mainContent = $(this.options.mainContentSelector);
            this.$detailContent = $(this.options.detailContentSelector);
            this.$loading = this.$detailContent.find(this.options.loadingSelector);
            this.$content = this.$detailContent.find(this.options.contentSelector);

            this.initializeEvents();
        }

        initializeEvents() {
            $(window).on('hashchange', () => this.handleHashChange());
        }

        async handleHashChange() {
            const id = irHelper.getHashId();
            if (id) {
                await this.load(id);
            } else {
                this.hide();
            }
        }

        async load(id) {
            this.showLoading();
            
            try {
                await this.options.onLoad(id);
                this.show();
            } catch (error) {
                irToast.error('Gagal memuat detail');
                console.error('Load detail error:', error);
            } finally {
                this.hideLoading();
            }
        }

        show() {
            this.$detailContent.addClass('active').show();
            this.$content.show();
            this.options.onShow();
        }

        hide() {
            this.$detailContent.removeClass('active').hide();
            this.$content.hide();
            this.options.onHide();
        }

        showLoading() {
            this.$loading.show();
            this.$content.hide();
        }

        hideLoading() {
            this.$loading.hide();
            this.$content.show();
        }
    }

    // Export DetailPanel
    window.irDetailPanel = DetailPanel;

})(jQuery);
