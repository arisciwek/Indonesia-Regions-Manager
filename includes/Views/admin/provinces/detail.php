<?php
/**
 * File: includes/Views/admin/provinces/detail.php
 * Version: 1.1.0
 * Description: Province detail panel template with tab interface
 */

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

            <!-- Detail Content -->
            <div id="provinceDetail" class="ir-province-detail">
                <!-- Tab Navigation -->
                <div class="ir-detail-tabs">
                    <button class="ir-tab active" data-tab="info">Informasi Dasar</button>
                    <button class="ir-tab" data-tab="cities">Kabupaten/Kota</button>
                    <button class="ir-tab" data-tab="stats">Statistik</button>
                </div>

                <!-- Tab Contents -->
                <div class="ir-detail-content">
                    <!-- Info Tab -->
                    <div id="infoContent" class="ir-tab-content active">
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
                    <div id="citiesContent" class="ir-tab-content">
                        <div class="ir-cities-header">
                            <h3>Daftar Kabupaten/Kota</h3>
                            <button type="button" class="button button-primary" id="btnAddCity">
                                Tambah Kab/Kota
                            </button>
                        </div>
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

                    <!-- Stats Tab -->
                    <div id="statsContent" class="ir-tab-content">
                        <!-- Statistics content will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>