# README.md

## SecretsClan E-Commerce Website

SecretsClan is a full-stack MERN e-commerce application built for a Pakistan-based retail business. The platform allows customers to browse products, manage a shopping cart, and place orders using Cash on Delivery.

## Features

* User authentication (Customer and Admin)
* Product listing and categorization
* Cart and checkout system
* Cash on Delivery order placement
* Admin panel for product and order management
* Product reviews
* Contact support form
* Cloudinary-based image handling

## Tech Stack

* React
* Node.js
* Express
* MongoDB
* Cloudinary

## Installation

### Backend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd SecretsClan/backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env` and update with your credentials
   - Update `MONGO_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string
   - Update Cloudinary credentials
   - Update email credentials

4. Run backend server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory
```bash
cd ../frontend
npm install
```

2. Start frontend application
```bash
npm start
```

## Environment Variables

Backend requires the following variables:

* `PORT` - Server port (default: 5000)
* `NODE_ENV` - Environment (development/production)
* `MONGO_URI` - MongoDB connection string
* `JWT_SECRET` - Secret key for JWT tokens
* `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
* `CLOUDINARY_API_KEY` - Cloudinary API key
* `CLOUDINARY_API_SECRET` - Cloudinary API secret
* `EMAIL_USER` - Email for contact forms
* `EMAIL_PASS` - Email password

## Project Structure

```
backend
├── config
│   └── db.js
├── controllers
│   ├── orderController.js
│   ├── productController.js
│   └── userController.js
├── middleware
│   └── authMiddleware.js
├── models
│   ├── orderModel.js
│   ├── productModel.js
│   └── userModel.js
├── routes
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── .env
├── .gitignore
├── package.json
└── server.js
frontend
├── public
│   ├── index.html
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── Contact.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   ├── Home.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── context
│   │   ├── CartContext.js
│   │   └── AuthContext.js
│   ├── hooks
│   │   ├── useCart.js
│   │   └── useAuth.js
│   ├── pages
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   ├── ContactPage.js
│   │   ├── HomePage.js
│   │   ├── OrderPage.js
│   │   ├── ProductPage.js
│   │   └── UserPage.js
│   ├── App.js
│   ├── index.js
│   └── reportWebVitals.js
├── .gitignore
├── package.json
└── README.md
```

## Usage

* Admin can log in to manage products and orders
* Customers can browse products and place COD orders

## Limitations

* No online card payments
* No shipping API integration
* No automated refund system

## Future Improvements

* Online payment gateway integration (if available)
* Order analytics
* Advanced promotions

## License

This project is proprietary and developed for SecretsClan.
