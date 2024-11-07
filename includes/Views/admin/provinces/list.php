<?php
if (!defined('ABSPATH')) exit;
?>
<div class="wrap ir-provinces">
    <!-- Convert to panel structure -->
    <div class="ir-panel">
        <div class="ir-panel-header">
            <h2>Daftar Provinsi</h2>
            <div class="ir-panel-actions">
                <button type="button" class="button button-primary" id="btnAddProvince">
                    Tambah Provinsi
                </button>
            </div>
        </div>
        <div class="ir-panel-content">
            <div class="ir-table-container">
                <table id="provincesTable" class="display" style="width:100%">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Provinsi</th>
                            <th>Jumlah Kab/Kota</th>
                            <th>Tanggal Dibuat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>ID</th>
                            <th>Nama Provinsi</th>
                            <th>Jumlah Kab/Kota</th>
                            <th>Tanggal Dibuat</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal tetap di luar panel -->
    <div id="provinceModal" class="ir-modal">
        <div class="ir-modal-content">
            <div class="ir-modal-header">
                <h2>Tambah Provinsi</h2>
                <button type="button" class="ir-modal-close">&times;</button>
            </div>
            <div class="ir-modal-body">
                <form id="provinceForm" method="post">
                    <input type="hidden" name="id" value="">
                    <div class="ir-form-group">
                        <label for="provinceName">Nama Provinsi</label>
                        <input type="text" 
                               id="provinceName" 
                               name="name" 
                               class="regular-text" 
                               required
                               minlength="3"
                               maxlength="100">
                        <div class="ir-error-message"></div>
                    </div>
                    <input type="hidden" id="provinceId">
                    <?php wp_nonce_field('ir_province_nonce', 'ir_nonce'); ?>
                </form>
            </div>
            <div class="ir-modal-footer">
                <button type="button" class="button" id="btnCancelProvince">Batal</button>
                <button type="submit" class="button button-primary" id="btnSaveProvince">Simpan</button>
            </div>
        </div>
    </div>
</div>