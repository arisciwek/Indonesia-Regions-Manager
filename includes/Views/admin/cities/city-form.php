<?php
if (!defined('ABSPATH')) exit;
?>
<div id="cityModal" class="ir-modal">
    <div class="ir-modal-content">
        <div class="ir-modal-header">
            <h2>Tambah Kabupaten/Kota</h2>
            <button type="button" class="ir-modal-close">&times;</button>
        </div>
        <div class="ir-modal-body">
            <form id="cityForm" method="post">
                <input type="hidden" name="id" value="">
                <input type="hidden" name="province_id" value="">
                
                <div class="ir-form-group">
                    <label for="cityName">Nama Kabupaten/Kota</label>
                    <input type="text" 
                           id="cityName" 
                           name="name" 
                           class="regular-text" 
                           required
                           minlength="3"
                           maxlength="100">
                    <div class="ir-error-message"></div>
                </div>

                <div class="ir-form-group">
                    <label for="cityType">Tipe</label>
                    <select id="cityType" 
                            name="type" 
                            class="regular-text" 
                            required>
                        <option value="">Pilih Tipe</option>
                        <option value="kabupaten">Kabupaten</option>
                        <option value="kota">Kota</option>
                    </select>
                    <div class="ir-error-message"></div>
                </div>

                <?php wp_nonce_field('ir_city_nonce', 'ir_nonce'); ?>
            </form>
        </div>
        <div class="ir-modal-footer">
            <button type="button" class="button" id="btnCancelCity">Batal</button>
            <button type="submit" class="button button-primary" id="btnSaveCity">Simpan</button>
        </div>
    </div>
</div>