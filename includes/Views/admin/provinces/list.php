<?php
if (!defined('ABSPATH')) exit;
?>
<div class="wrap ir-provinces">
    <h1>Daftar Provinsi</h1>
    
    <!-- Tombol Tambah -->
    <div class="ir-toolbar">
        <button type="button" class="button button-primary" id="btnAddProvince">
            Tambah Provinsi
        </button>
    </div>
    
    <!-- Modal Form Provinsi -->
    <div id="provinceModal" class="ir-modal">
        <div class="ir-modal-content">
            <div class="ir-modal-header">
                <h2>Tambah Provinsi</h2>
                <button type="button" class="ir-modal-close">&times;</button>
            </div>
            <div class="ir-modal-body">
                <form id="provinceForm" onsubmit="return false;">  <!-- Tambahkan onsubmit -->
                    <div class="ir-form-group">
                        <label for="provinceName">Nama Provinsi</label>
                        <input type="text" id="provinceName" name="name" class="regular-text" required>
                        <div class="ir-error-message"></div>
                    </div>
                    <input type="hidden" id="provinceId" name="id" value="">
                    <?php wp_nonce_field('ir_province_nonce', 'ir_nonce'); ?>
                </form>
            </div>
            <div class="ir-modal-footer">
                <button type="button" class="button" id="btnCancelProvince">Batal</button>
                <button type="submit" class="button button-primary" id="btnSaveProvince">Simpan</button>
            </div>
        </div>
    </div>

    <!-- Tabel Provinsi -->
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