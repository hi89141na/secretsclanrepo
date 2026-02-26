## Plan: Replace Native Alerts with Custom Dialog Component

Replace all 9 native `confirm()` dialogs with a reusable `ConfirmDialog` component that matches your existing modal design pattern. The component will use your current Tailwind + Framer Motion stack, support dark mode, and handle both delete confirmations and general action confirmations.

**Steps**
1. Create [ConfirmDialog.jsx](frontend/src/components/common/ConfirmDialog.jsx) component with:
   - Animated backdrop and dialog using `framer-motion`
   - Dark mode support matching existing modals
   - Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `variant` (danger/primary)
   - Click outside to close, ESC key handler
   - Async action support with loading state
   
2. Create [useConfirm.jsx](frontend/src/hooks/useConfirm.jsx) hook for cleaner usage pattern:
   - Returns `{ showConfirm, ConfirmDialog }` 
   - Manages dialog state internally
   - Simplifies replacement of `confirm()` calls

3. Replace `confirm()` in admin pages (6 files):
   - [ManageUsersPage.jsx](frontend/src/pages/admin/ManageUsersPage.jsx#L45) - User deletion
   - [ManageProductsPage.jsx](frontend/src/pages/admin/ManageProductsPage.jsx#L103) - Product deletion
   - [ManageOffersPage.jsx](frontend/src/pages/admin/ManageOffersPage.jsx#L105) - Offer deletion
   - [ManageCategoriesPage.jsx](frontend/src/pages/admin/ManageCategoriesPage.jsx#L86) - Category deletion
   - [ManageContactPage.jsx](frontend/src/pages/admin/ManageContactPage.jsx#L44) - Contact deletion
   - [SendEmailPage.jsx](frontend/src/pages/admin/SendEmailPage.jsx#L57) - Bulk email confirmation

4. Replace `confirm()` in user pages (3 files):
   - [CartPage.jsx](frontend/src/pages/user/CartPage.jsx#L150) - Clear cart
   - [OrdersPage.jsx](frontend/src/pages/user/OrdersPage.jsx#L29) - Cancel order
   - [OrderDetailPage.jsx](frontend/src/pages/user/OrderDetailPage.jsx#L32) - Cancel order

**Verification**
- Test each delete/cancel action to ensure dialog appears correctly
- Verify dark mode styling matches existing modals
- Confirm ESC key and click-outside close the dialog
- Check that Cancel button prevents action, Confirm button executes it
- Test loading state during async operations

**Decisions**
- Use custom component to match existing design system
- Leverage existing Button component for dialog actions
- Pattern: `useConfirm` hook for simple integration
- Support both danger (delete) and primary (confirm) variants
