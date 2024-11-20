<?php
/**
 * File: includes/Views/admin/provinces/detail.php
 * Version: 1.1.1
 * Last Updated: 2024-11-17 22:49:00
 * Description: Province detail panel template with enhanced UI
 */

if (!defined('ABSPATH')) exit;
?>
<div class="wrap ir-provinces-detail">
    <div class="ir-panel">
        <!-- Panel Header -->
        <div class="ir-panel-header">
            <div class="ir-header-content">
                <h2>
                    <span class="dashicons dashicons-location"></span>
                    Detail Provinsi: 
                    <span id="provinceDetailName" class="province-name">-</span>
                </h2>
                <div class="ir-panel-actions">
                    <button type="button" class="button ir-btn-edit" id="btnEditProvince">
                        <span class="dashicons dashicons-edit"></span>
                        Edit
                    </button>
                    <button type="button" class="button ir-btn-delete" id="btnDeleteProvince">
                        <span class="dashicons dashicons-trash"></span>
                        Hapus
                    </button>
                </div>
            </div>
        </div>
        
        <div class="ir-panel-content">
            <!-- Loading State -->
            <div id="provinceDetailLoading" class="ir-loading">
                <div class="spinner"></div>
                <span>Memuat data...</span>
            </div>

            <!-- Detail Content -->
            <div id="provinceDetail" class="ir-province-detail">
                <!-- Enhanced Tab Navigation -->
                <div class="ir-detail-tabs">
                    <button class="ir-tab active" data-tab="info">
                        <span class="dashicons dashicons-info-outline"></span>
                        <span class="tab-text">Informasi Dasar</span>
                    </button>
                    <button class="ir-tab" data-tab="cities">
                        <span class="dashicons dashicons-building"></span>
                        <span class="tab-text">Kabupaten/Kota</span>
                    </button>
                    <button class="ir-tab" data-tab="stats">
                        <span class="dashicons dashicons-chart-bar"></span>
                        <span class="tab-text">Statistik</span>
                    </button>
                </div>

                <!-- Enhanced Tab Contents -->
                <div class="ir-detail-content">
                    <!-- Info Tab -->
                    <div id="infoContent" class="ir-tab-content active">
                        <div class="ir-detail-stats">
                            <div class="ir-stat-card">
                                <div class="stat-icon">
                                    <span class="dashicons dashicons-building"></span>
                                </div>
                                <div class="stat-content">
                                    <h3>Total Kabupaten/Kota</h3>
                                    <span id="totalCities" class="stat-value">-</span>
                                </div>
                            </div>
                            <div class="ir-stat-card">
                                <div class="stat-icon">
                                    <span class="dashicons dashicons-calendar-alt"></span>
                                </div>
                                <div class="stat-content">
                                    <h3>Dibuat Pada</h3>
                                    <span id="createdAt" class="stat-value">-</span>
                                </div>
                            </div>
                            <div class="ir-stat-card">
                                <div class="stat-icon">
                                    <span class="dashicons dashicons-update"></span>
                                </div>
                                <div class="stat-content">
                                    <h3>Terakhir Diupdate</h3>
                                    <span id="updatedAt" class="stat-value">-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cities Tab -->
                    <div id="citiesContent" class="ir-tab-content">
                        <div class="ir-cities-header">
                            <div class="ir-section-title">
                                <span class="dashicons dashicons-building"></span>
                                <h3>Daftar Kabupaten/Kota</h3>
                            </div>
                            <button type="button" class="button button-primary ir-btn-add" id="btnAddCity">
                                <span class="dashicons dashicons-plus-alt2"></span>
                                Tambah Kab/Kota
                            </button>
                        </div>
                        <div class="ir-table-container">
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

                    <!-- Stats Tab -->
                    <div id="statsContent" class="ir-tab-content">
                        <div class="ir-stats-container">
                            <!-- Placeholder untuk konten statistik -->
                            <div class="ir-stats-placeholder">
                                <span class="dashicons dashicons-chart-bar"></span>
                                <p>Statistik akan tersedia segera</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
