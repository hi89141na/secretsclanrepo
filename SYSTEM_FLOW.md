# 🔄 STORE-WIDE OFFERS SYSTEM FLOW

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN CREATES OFFER                      │
│  - Title, Description, Discount Type/Value                   │
│  - Start/End Dates, Scope (Store/Categories/Products)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               VALIDATION LAYER (Controller)                  │
│  ✓ Check store-wide overlap                                 │
│  ✓ Validate date range                                      │
│  ✓ Ensure scope requirements met                            │
│  ✓ Positive discount value                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (Offer Model)                        │
│  - Stores all offer details                                 │
│  - References to products/categories                         │
│  - isActive flag                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│   SCHEDULER          │  │  PRODUCT REQUESTS    │
│  (Every hour)        │  │  (Real-time)         │
│                      │  │                      │
│  Checks expired      │  │  GET /api/products   │
│  offers and          │  │  GET /api/products/  │
│  deactivates them    │  │       :id            │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           │                         ▼
           │              ┌──────────────────────┐
           │              │  PRICING SERVICE     │
           │              │                      │
           │              │  1. Get active offers│
           │              │  2. Find applicable  │
           │              │  3. Calculate best   │
           │              │  4. Apply discount   │
           │              └──────────┬───────────┘
           │                         │
           │                         ▼
           │              ┌──────────────────────┐
           │              │   PRODUCT RESPONSE   │
           │              │                      │
           │              │  - originalPrice     │
           │              │  - discountedPrice   │
           │              │  - appliedOffer      │
           │              └──────────┬───────────┘
           │                         │
           └─────────────────────────┤
                                     ▼
                          ┌──────────────────────┐
                          │   FRONTEND DISPLAY   │
                          │                      │
                          │  • Banner (homepage) │
                          │  • Product cards     │
                          │  • Offer page        │
                          └──────────────────────┘
```

## Request Flow Example

### Admin Creates Store-Wide Offer

```
1. Admin → POST /api/offers
   {
     title: "Black Friday Sale",
     scope: "entire_store",
     discountType: "percentage",
     discountValue: 30,
     startDate: "2026-11-27",
     endDate: "2026-11-30"
   }

2. Controller validates:
   ✓ No other store-wide offer active
   ✓ End date > Start date
   ✓ Positive discount value

3. Saves to database with isActive: true

4. Response: { success: true, data: {...} }
```

### Customer Visits Homepage

```
1. Frontend → GET /api/offers/store-wide

2. Backend checks:
   - scope === 'entire_store'
   - isActive === true
   - startDate <= now <= endDate

3. Returns active offer or null

4. If offer exists:
   → OfferBanner renders
   → Shows scrolling announcement
   → "Shop Now" links to /offers/:id
```

### Customer Views Products

```
1. Frontend → GET /api/products

2. Product Controller:
   a. Fetches products from DB
   b. Gets active offers
   c. Calls applyOffersToProducts()
   
3. applyOffersToProducts():
   a. For each product:
      - Get applicable offers (via pricingService)
      - Calculate best discount
      - Apply if better than salePrice
   
4. Returns products with:
   - originalPrice
   - discountedPrice (if offer applied)
   - appliedOffer details

5. Frontend displays:
   ~~$100~~ → $70 (30% off)
```

## Data Flow Diagram

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │ Create/Update Offer
     ▼
┌─────────────────┐         ┌──────────────┐
│ Offer Controller│────────▶│  Validation  │
└────┬────────────┘         └──────┬───────┘
     │                             │
     │ Save                        │ Check
     ▼                             ▼
┌──────────────┐           ┌──────────────┐
│   MongoDB    │           │ Existing     │
│ Offer.find() │◀──────────│ Store-Wide   │
└───┬──────────┘           │ Offers       │
    │                      └──────────────┘
    │ Active Offers
    ▼
┌──────────────────┐
│ Pricing Service  │
│ - getApplicable  │
│ - applyBest      │
└────┬─────────────┘
     │ Calculated Prices
     ▼
┌──────────────────┐
│ Product Response │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│   Frontend UI    │
│ - Banner         │
│ - Product Cards  │
│ - Offer Page     │
└──────────────────┘
```

## Priority System

```
Product Pricing Priority (Highest to Lowest):

1. Product.salePrice (if active)
   ↓ (takes precedence)
   
2. Offer Discount (store-wide, category, or product)
   ↓ (applied if no sale)
   
3. Product.price (original)
   ↓ (fallback)

Example:
- Product: $100
- Sale Price: $80 (active)
- Offer: 30% off (= $70)
→ Customer pays: $80 (sale wins)

Example 2:
- Product: $100
- Sale Price: none
- Offer: 30% off (= $70)
→ Customer pays: $70 (offer applies)
```

## Scheduler Workflow

```
Every Hour:
1. Check current time
2. Query: { isActive: true, endDate < now }
3. For each expired offer:
   - Set isActive = false
   - Save to database
   - Log: "Auto-deactivated expired offer: [title]"
```

---
**System Status**: ✅ Fully Integrated and Operational
