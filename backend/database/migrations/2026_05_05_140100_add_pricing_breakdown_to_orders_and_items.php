<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Order-level + item-level pricing snapshots.
 *
 * orders.service_fee_amount   — alıcıdan tahsil edilen platform hizmet bedeli (sabit, varsayılan 50₺)
 * orders.platform_commission_total — tüm satıcı kalemlerinden kesilen toplam komisyon (varsayılan %10)
 * orders.stopaj_total         — KDV hariç kalem geliri üzerinden kesilen toplam stopaj
 * orders.kdv_total            — sipariş içindeki tüm kalemlerin KDV toplamı (KDV dahil fiyattan ayrıştırılmış)
 *
 * order_items.kdv_rate        — kalemde uygulanan KDV oranı (%) snapshot
 * order_items.kdv_amount      — kalemin KDV tutarı (KDV dahil fiyattan ayrıştırılmış)
 * order_items.platform_commission_amount — kalem bazlı komisyon kesintisi
 * order_items.service_fee_share          — sabit hizmet bedelinin bu kaleme düşen payı
 *
 * Mevcut kolonlar:
 *  - order_items.commission_amount       (legacy: flat_service_fee_share + categoryRate komisyonu)
 *  - order_items.marketplace_fee         (legacy)
 *  - order_items.withholding_tax         (= stopaj)
 *  - order_items.shipping_cost_share     (kalem bazlı kargo payı)
 *  - order_items.net_seller_amount       (toplam kesintilerden sonra kalan)
 *  - order_items.seller_payout_amount    (= net_seller_amount; satıcıya transferde kullanılır)
 *
 * Yeni alanlar geri-uyumluluğu bozmaz; eski kolonlar olduğu gibi tutulur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'service_fee_amount')) {
                $table->decimal('service_fee_amount', 10, 2)->default(0)->after('total_commission');
            }
            if (! Schema::hasColumn('orders', 'platform_commission_total')) {
                $table->decimal('platform_commission_total', 12, 2)->default(0)->after('service_fee_amount');
            }
            if (! Schema::hasColumn('orders', 'stopaj_total')) {
                $table->decimal('stopaj_total', 12, 2)->default(0)->after('platform_commission_total');
            }
            if (! Schema::hasColumn('orders', 'kdv_total')) {
                $table->decimal('kdv_total', 12, 2)->default(0)->after('stopaj_total');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'kdv_rate')) {
                $table->decimal('kdv_rate', 5, 2)->default(20)->after('total_price');
            }
            if (! Schema::hasColumn('order_items', 'kdv_amount')) {
                $table->decimal('kdv_amount', 12, 2)->default(0)->after('kdv_rate');
            }
            if (! Schema::hasColumn('order_items', 'platform_commission_amount')) {
                $table->decimal('platform_commission_amount', 12, 2)->default(0)->after('commission_amount');
            }
            if (! Schema::hasColumn('order_items', 'service_fee_share')) {
                $table->decimal('service_fee_share', 10, 2)->default(0)->after('platform_commission_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $drop = [];
            foreach (['service_fee_amount', 'platform_commission_total', 'stopaj_total', 'kdv_total'] as $col) {
                if (Schema::hasColumn('orders', $col)) {
                    $drop[] = $col;
                }
            }
            if (! empty($drop)) {
                $table->dropColumn($drop);
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            $drop = [];
            foreach (['kdv_rate', 'kdv_amount', 'platform_commission_amount', 'service_fee_share'] as $col) {
                if (Schema::hasColumn('order_items', $col)) {
                    $drop[] = $col;
                }
            }
            if (! empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
