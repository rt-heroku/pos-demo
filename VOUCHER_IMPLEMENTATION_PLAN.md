# Voucher System Implementation Plan

## Phase 1: Database Setup
- [x] Create `customer_vouchers` table with all required fields
- [x] Add `voucher_id` to `transaction_items` table
- [x] Create indexes for performance
- [x] Create helper functions for voucher validation and discount calculation
- [x] Create triggers for automatic voucher updates

## Phase 2: Backend API Development

### 2.1 Voucher Management APIs
- [ ] `GET /api/customers/:id/vouchers` - Get all vouchers for a customer
- [ ] `GET /api/vouchers/:id` - Get specific voucher details
- [ ] `POST /api/vouchers/sync` - Sync vouchers from MuleSoft
- [ ] `PUT /api/vouchers/:id` - Update voucher status

### 2.2 Voucher Application Logic
- [ ] `POST /api/transactions/:id/apply-voucher` - Apply voucher to transaction
- [ ] `DELETE /api/transactions/:id/remove-voucher` - Remove voucher from transaction
- [ ] `GET /api/vouchers/validate/:id` - Validate voucher before use

## Phase 3: Frontend Implementation

### 3.1 Voucher Selection UI
- [ ] Add voucher section to cart when customer is selected
- [ ] Display available vouchers in a scrollable list
- [ ] Show voucher details (type, value, expiration, description)
- [ ] Add voucher selection/removal functionality

### 3.2 Voucher Application Logic
- [ ] Auto-apply product-specific vouchers when matching products are in cart
- [ ] Manual selection for value and general discount vouchers
- [ ] Show voucher discount in cart totals
- [ ] Handle partial value voucher usage

### 3.3 Voucher Display Components
- [ ] VoucherCard component for displaying voucher info
- [ ] VoucherSelector component for choosing vouchers
- [ ] VoucherApplied component for showing applied vouchers

## Phase 4: MuleSoft Integration

### 4.1 API Endpoints
- [ ] `GET /members/vouchers?member=<customer_id>` - Fetch customer vouchers
- [ ] `POST /members/vouchers/redeem` - Redeem voucher
- [ ] `PUT /members/vouchers/:id` - Update voucher status

### 4.2 Data Synchronization
- [ ] Sync vouchers when customer is selected
- [ ] Update voucher status after transaction
- [ ] Handle voucher expiration

## Phase 5: Testing & Validation

### 5.1 Unit Tests
- [ ] Test voucher validation functions
- [ ] Test discount calculation logic
- [ ] Test voucher state transitions

### 5.2 Integration Tests
- [ ] Test voucher application in transactions
- [ ] Test MuleSoft API integration
- [ ] Test voucher expiration handling

## Implementation Details

### Voucher Types Implementation

#### 1. Value Vouchers
- **Usage**: Can be used for any amount up to remaining value
- **Application**: Manual selection by user
- **Calculation**: `discount = min(item_price, remaining_value)`
- **State**: Remains active until fully redeemed

#### 2. Discount Vouchers
- **Usage**: Percentage discount on total or specific items
- **Application**: Manual selection by user
- **Calculation**: `discount = price * (discount_percent / 100)`
- **State**: Becomes redeemed after use

#### 3. Product-Specific Vouchers
- **Usage**: Auto-applies when matching product is in cart
- **Application**: Automatic or manual selection
- **Calculation**: Based on voucher definition (percentage or fixed value)
- **State**: Becomes redeemed after use

### UI/UX Flow

1. **Customer Selection**: When customer is selected in cart
2. **Voucher Fetch**: Call MuleSoft API to get customer vouchers
3. **Voucher Display**: Show available vouchers in cart sidebar
4. **Auto-Application**: Auto-apply product-specific vouchers
5. **Manual Selection**: Allow user to select value/discount vouchers
6. **Discount Calculation**: Show voucher discounts in cart totals
7. **Transaction Processing**: Apply vouchers during checkout
8. **Status Update**: Update voucher status after successful transaction

### Database Schema Highlights

- **Serial ID**: Auto-incrementing primary key
- **SF_ID**: Salesforce ID for external reference
- **Customer Relationship**: Foreign key to customers table
- **Product Relationship**: Foreign key to products table for product-specific vouchers
- **Value Tracking**: Separate fields for face_value, remaining_value, redeemed_value
- **Status Management**: Status field with check constraints
- **Audit Trail**: Created/updated timestamps and user tracking

### Security Considerations

- **Voucher Validation**: Server-side validation before application
- **Expiration Checking**: Automatic expiration handling
- **Double Usage Prevention**: Status management to prevent reuse
- **Customer Verification**: Ensure vouchers belong to selected customer
- **Transaction Integrity**: Atomic voucher updates with transaction processing
