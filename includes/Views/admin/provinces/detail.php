<?php
if (!defined('ABSPATH')) exit;
?>
<div class="wrap ir-provinces-detail">
    <div class="ir-panel">
        <div class="ir-panel-header">
            <h2>
                Detail Provinsi: 
                <span id="provinceDetailName">-</span>
            </h2>
            <div class="ir-panel-actions">
                <button type="button" class="button" id="btnEditProvince">Edit</button>
                <button type="button" class="button button-link-delete" id="btnDeleteProvince">Hapus</button>
            </div>
        </div>
        <div class="ir-panel-content">
            <!-- Loading Placeholder -->
            <div id="provinceDetailLoading" class="ir-loading">
                <div class="spinner"></div>
            </div>

            <!-- Detail Content with Tabs -->
            <div id="provinceDetail" class="ir-province-detail">
                <!-- Tab Navigation -->
                <div class="ir-tabs">
                    <button type="button" class="ir-tab-btn active" data-tab="info">
                        Informasi Provinsi
                    </button>
                    <button type="button" class="ir-tab-btn" data-tab="cities">
                        Kabupaten/Kota
                    </button>
                </div>

                <!-- Tab Contents -->
                <div class="ir-tab-contents">
                    <!-- Info Tab -->
                    <div id="tabInfo" class="ir-tab-content active" data-tab="info">
                        <div class="ir-detail-stats">
                            <div class="ir-stat-item">
                                <label>Total Kabupaten/Kota</label>
                                <span id="totalCities">-</span>
                            </div>
                            <div class="ir-stat-item">
                                <label>Dibuat Pada</label>
                                <span id="createdAt">-</span>
                            </div>
                            <div class="ir-stat-item">
                                <label>Terakhir Diupdate</label>
                                <span id="updatedAt">-</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cities Tab -->
                    <div id="tabCities" class="ir-tab-content" data-tab="cities">
                        <div class="ir-toolbar">
                            <button type="button" class="button button-primary" id="btnAddCity">
                                Tambah Kab/Kota
                            </button>
                        </div>
                        <div class="ir-cities-table">
                            <table id="citiesTable" class="display" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nama</th>
                                        <th>Tipe</th>
                                        <th>Tanggal Dibuat</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>