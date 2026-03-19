# 🚀 Quick Start Guide - Store-Wide Offers

## For Administrators

### Step 1: Access Admin Panel
1. Login as admin
2. Navigate to `/admin/offers`

### Step 2: Create Your First Store-Wide Offer

**Example: Black Friday Sale**
```
Title: Black Friday Mega Sale!
Description: Get 25% off everything in store
Discount Type: Percentage
Discount Value: 25
Start Date: 2026-11-27 00:00
End Date: 2026-11-30 23:59
Scope: Entire Store
```

Click "Create Offer" ✅

### Step 3: Verify
1. Visit homepage - You should see the scrolling banner
2. Click "Shop Now" to see all products with discount
3. Check product pages - Original prices should be struck through

### Common Scenarios

#### Scenario 1: Category-Specific Sale
```
Title: Electronics Flash Sale
Scope: Categories
Select: Electronics, Gadgets
Discount: 30%
```

#### Scenario 2: Selected Products Sale
```
Title: Clearance Items
Scope: Products
Select: Individual products from list
Discount: Rs. 500 (Fixed amount)
```

#### Scenario 3: Limited Time Deal
```
Title: 2-Hour Flash Sale
Start: Today 6:00 PM
End: Today 8:00 PM
Discount: 40%
```

### ⚠️ Important Rules

1. **One Store-Wide Offer at a Time**
   - System allows only 1 active store-wide offer
   - Category and product offers can coexist

2. **Product Discounts Take Precedence**
   - If a product has salePrice set, it takes priority
   - Offers apply when no product-level discount exists

3. **Automatic Management**
   - Offers activate automatically at start time
   - Offers expire automatically at end time
   - Scheduler checks every hour

### Troubleshooting

**Problem**: Can't create store-wide offer
- **Reason**: Another store-wide offer exists with overlapping dates
- **Solution**: Deactivate or delete the existing offer first

**Problem**: Banner not showing
- **Reason**: No active store-wide offer OR user dismissed it
- **Solution**: Check offer is active and within date range

**Problem**: Products not showing discount
- **Reason**: Product may have its own salePrice
- **Solution**: Product sale prices override offer discounts

### API Endpoints for Testing

```bash
# Get active store-wide offer
curl http://localhost:5000/api/offers/store-wide

# Get all active offers
curl http://localhost:5000/api/offers/active

# Get products with specific offer
curl http://localhost:5000/api/offers/{offerId}/products

# Get all offers (Admin only - needs auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/offers
```

---
**Need Help?** Check STORE_OFFERS_IMPLEMENTATION.md for detailed documentation
