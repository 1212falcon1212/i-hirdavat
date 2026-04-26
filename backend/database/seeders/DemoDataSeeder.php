<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SellerWallet;
use App\Models\SellerBankAccount;
use App\Models\PayoutRequest;
use App\Models\WalletTransaction;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Get Target User (The one user wants to test with)
            $targetUser = User::where('email', 'deneme@deneme.com')->first();

            if (!$targetUser) {
                $this->command->error("Kullanıcı bulunamadı: deneme@deneme.com");
                return;
            }

            // 2. Create/Get a Dummy Seller (to sell items TO the target user)
            $otherSeller = User::firstOrCreate(
                ['email' => 'seller@demo.com'],
                [
                    'password' => Hash::make('password'),
                    'role' => 'seller',
                    'seller_name' => 'Demo Hırdavat Deposu',
                    'city' => 'Ankara',
                    'address' => 'Kizilay No:5',
                    'is_verified' => true,
                ]
            );

            // 3. Setup Wallet for Target User (To test Seller Dashboard)
            $wallet = SellerWallet::firstOrCreate(
                ['seller_id' => $targetUser->id],
                [
                    'balance_available' => 12500.00,
                    'balance_pending' => 4500.00,
                    'currency' => 'TRY'
                ]
            );

            // 4. Setup Bank Account for Target User
            $bankAccount = SellerBankAccount::firstOrCreate(
                ['seller_id' => $targetUser->id],
                [
                    'bank_name' => 'Test Bankası',
                    'account_holder' => $targetUser->seller_name,
                    'iban' => 'TR12' . substr(str_shuffle('01234567890123456789'), 0, 22),
                    'is_default' => true,
                ]
            );

            // 5. Create Product & Offer (sold by Other Seller)
            $category = Category::firstOrCreate(['slug' => 'test-kategori'], ['name' => 'Test Kategori']);

            $product = Product::firstOrCreate(
                ['barcode' => '8690000000001'],
                [
                    'name' => 'Test Ürünü 500mg',
                    'brand' => 'TestBrand',
                    'category_id' => $category->id,
                    'is_active' => true,
                    'image' => 'https://via.placeholder.com/300',
                ]
            );

            $offer = Offer::firstOrCreate(
                ['product_id' => $product->id, 'seller_id' => $otherSeller->id],
                [
                    'price' => 150.00,
                    'stock' => 1000,
                    'expiry_date' => now()->addYear(),
                    'status' => 'active'
                ]
            );

            // 6. Create Orders (Target User BUYING from Other Seller)
            $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

            foreach ($statuses as $index => $status) {
                // Check if order exists to avoid duplicate entry error
                $orderNumber = 'ORD-TEST-' . ($index + 1);

                if (Order::where('order_number', $orderNumber)->exists()) {
                    continue;
                }

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $targetUser->id,
                    'subtotal' => 1500.00,
                    'total_commission' => 75.00,
                    'total_amount' => 1575.00,
                    'status' => $status,
                    'payment_status' => $status === 'cancelled' ? 'failed' : 'paid',
                    'shipping_address' => json_encode(['address' => $targetUser->address, 'city' => $targetUser->city]),
                    'notes' => 'Otomatik test siparişi ' . ($index + 1),
                    'created_at' => now()->subDays($index * 2),
                ]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'offer_id' => $offer->id,
                    'seller_id' => $otherSeller->id,
                    'quantity' => 10,
                    'unit_price' => 150.00,
                    'total_price' => 1500.00,
                    'commission_rate' => 5.00,
                    'commission_amount' => 75.00,
                    'seller_payout_amount' => 1425.00,
                ]);
            }

            // 7. Create Wallet Transactions (Target User EARNING money - as if they sold something)
            // Even if role is pharmacist, having these allows verifying the UI components
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'sale',
                'amount' => 2500.00,
                'direction' => 'credit',
                'balance_type' => 'available',
                'description' => "Test Satış Geliri #1",
                'created_at' => now()->subDays(5),
            ]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'withdrawal',
                'amount' => 1000.00,
                'direction' => 'debit',
                'balance_type' => 'available',
                'description' => "Para Çekme Talebi #123",
                'created_at' => now()->subDays(3),
            ]);

            // 8. Create Payout Requests for Target User
            PayoutRequest::create([
                'seller_id' => $targetUser->id,
                'bank_account_id' => $bankAccount->id,
                'amount' => 1000.00,
                'status' => 'completed',
                'processed_at' => now()->subDays(2),
                'transaction_reference' => 'TRX-TEST-001',
            ]);

            PayoutRequest::create([
                'seller_id' => $targetUser->id,
                'bank_account_id' => $bankAccount->id,
                'amount' => 4500.00,
                'status' => 'pending',
                'created_at' => now()->subHours(5),
            ]);
        });
    }
}
