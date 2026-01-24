# SecretsClan Backend API

Complete backend API for SecretsClan e-commerce platform built with Node.js, Express, MongoDB, and Cloudinary.

## Features

- JWT-based authentication system
- Product management with image uploads
- Category management
- Order management (Cash on Delivery)
- Review and rating system
- Contact form with email notifications
- Cloudinary integration for image storage
- Role-based access control (Admin/Customer)

## Tech Stack

- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: bcryptjs, CORS

## Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Create .env file in the backend root:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/secretsclan

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. Start the server:
```
npm run dev
```

## API Base URL

```
http://localhost:5000/api
```

---

## Authentication Endpoints

### Register User
- **POST** /api/auth/register
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Login User
- **POST** /api/auth/login
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: Same as register

### Get User Profile
- **GET** /api/auth/profile
- **Headers**: Authorization: Bearer <token>
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Update User Profile
- **PUT** /api/auth/profile
- **Headers**: Authorization: Bearer <token>
- **Body**:
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "newpassword123"
}
```

---

## Category Endpoints

### Get All Categories
- **GET** /api/categories
- **Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "category_id",
      "name": "Women's Clothing",
      "slug": "womens-clothing",
      "description": "Category description",
      "image": "https://cloudinary.com/image.jpg"
    }
  ]
}
```

### Get Category by ID
- **GET** /api/categories/:id

### Create Category (Admin Only)
- **POST** /api/categories
- **Headers**: Authorization: Bearer <admin_token>
- **Body**:
```json
{
  "name": "Women's Clothing",
  "description": "Latest women's fashion",
  "image": "https://cloudinary.com/image.jpg"
}
```

### Update Category (Admin Only)
- **PUT** /api/categories/:id
- **Headers**: Authorization: Bearer <admin_token>

### Delete Category (Admin Only)
- **DELETE** /api/categories/:id
- **Headers**: Authorization: Bearer <admin_token>

---

## Product Endpoints

### Get All Products
- **GET** /api/products
- **Query Params**:
  - category: Filter by category ID
  - eatured: 	rue for featured products
  - search: Search by product name
- **Example**: /api/products?category=123&featured=true&search=shirt

### Get Featured Products
- **GET** /api/products/featured
- Returns top 8 featured products

### Get Product by ID
- **GET** /api/products/:id

### Get Products by Category
- **GET** /api/products/category/:categoryId

### Create Product (Admin Only)
- **POST** /api/products
- **Headers**: Authorization: Bearer <admin_token>
- **Body**:
```json
{
  "name": "Stylish Shirt",
  "description": "Beautiful stylish shirt for women",
  "price": 2500,
  "category": "category_id",
  "stock": 50,
  "brand": "SecretsClan",
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ]
}
```

### Update Product (Admin Only)
- **PUT** /api/products/:id
- **Headers**: Authorization: Bearer <admin_token>

### Delete Product (Admin Only)
- **DELETE** /api/products/:id
- **Headers**: Authorization: Bearer <admin_token>

---

## File Upload Endpoints

### Upload Single Image
- **POST** /api/upload/image
- **Headers**: Authorization: Bearer <admin_token>
- **Body**: FormData with image field
- **Response**:
```json
{
  "success": true,
  "url": "https://cloudinary.com/uploaded_image.jpg",
  "publicId": "folder/image_id"
}
```

### Upload Multiple Product Images
- **POST** /api/upload/products
- **Headers**: Authorization: Bearer <admin_token>
- **Body**: FormData with images field (multiple files)
- **Response**:
```json
{
  "success": true,
  "urls": [
    {
      "url": "https://cloudinary.com/image1.jpg",
      "publicId": "products/id1"
    }
  ]
}
```

### Upload Category Image
- **POST** /api/upload/category
- **Headers**: Authorization: Bearer <admin_token>
- **Body**: FormData with image field

---

## Order Endpoints

### Get User Orders
- **GET** /api/orders
- **Headers**: Authorization: Bearer <token>

### Get All Orders (Admin Only)
- **GET** /api/orders/all
- **Headers**: Authorization: Bearer <admin_token>

### Get Order by ID
- **GET** /api/orders/:id
- **Headers**: Authorization: Bearer <token>

### Create Order
- **POST** /api/orders
- **Headers**: Authorization: Bearer <token>
- **Body**:
```json
{
  "orderItems": [
    {
      "product": "product_id",
      "name": "Product Name",
      "quantity": 2,
      "price": 2500,
      "image": "https://cloudinary.com/image.jpg"
    }
  ],
  "shippingAddress": {
    "address": "123 Street",
    "city": "Karachi",
    "postalCode": "75500",
    "country": "Pakistan",
    "phone": "03001234567"
  },
  "itemsPrice": 5000,
  "shippingPrice": 200,
  "totalPrice": 5200
}
```

### Update Order Status (Admin Only)
- **PUT** /api/orders/:id/status
- **Headers**: Authorization: Bearer <admin_token>
- **Body**:
```json
{
  "status": "confirmed"
}
```
- **Allowed statuses**: pending, confirmed, shipped, delivered, cancelled

### Cancel Order
- **PUT** /api/orders/:id/cancel
- **Headers**: Authorization: Bearer <token>

---

## Review Endpoints

### Get Product Reviews
- **GET** /api/reviews/product/:productId

### Get User's Review for Product
- **GET** /api/reviews/user/:productId
- **Headers**: Authorization: Bearer <token>

### Create Review
- **POST** /api/reviews
- **Headers**: Authorization: Bearer <token>
- **Body**:
```json
{
  "product": "product_id",
  "rating": 5,
  "comment": "Excellent product!"
}
```

### Update Review
- **PUT** /api/reviews/:id
- **Headers**: Authorization: Bearer <token>

### Delete Review
- **DELETE** /api/reviews/:id
- **Headers**: Authorization: Bearer <token>

---

## Contact Endpoint

### Submit Contact Form
- **POST** /api/contact
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I have a question about..."
}
```

---

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  images: [String],
  variants: Mixed,
  featured: Boolean,
  rating: Number (0-5),
  numReviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  orderItems: [{
    product: ObjectId,
    name: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: String (default: COD),
  itemsPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  status: String (pending/confirmed/shipped/delivered/cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

### Review
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration Guide

### 1. Setup Axios/Fetch
```javascript
const API_URL = 'http://localhost:5000/api';

// Set auth token
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = Bearer ${token};
```

### 2. Authentication Flow
```javascript
// Register
const register = async (name, email, password) => {
  const { data } = await axios.post(${API_URL}/auth/register, {
    name, email, password
  });
  localStorage.setItem('token', data.token);
  return data.user;
};

// Login
const login = async (email, password) => {
  const { data } = await axios.post(${API_URL}/auth/login, {
    email, password
  });
  localStorage.setItem('token', data.token);
  return data.user;
};
```

### 3. Fetch Products
```javascript
const getProducts = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axios.get(${API_URL}/products?);
  return data.data;
};
```

### 4. Image Upload
```javascript
const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
  const { data } = await axios.post(${API_URL}/upload/products, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.urls;
};
```

### 5. Create Order
```javascript
const createOrder = async (orderData) => {
  const { data } = await axios.post(${API_URL}/orders, orderData);
  return data.data;
};
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (Admin only)
- 404: Not Found
- 500: Server Error

---

## Middleware

### Authentication Middleware
- **protect**: Verifies JWT token
- **admin**: Checks if user role is 'admin'

Usage in routes:
```javascript
router.post('/products', protect, admin, createProduct);
```

### File Upload Middleware
- **upload.single('image')**: Single file
- **upload.array('images', 10)**: Multiple files (max 10)
- File size limit: 5MB
- Allowed formats: jpg, jpeg, png, gif, webp

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGO_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | JWT secret key | your_secret_key |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | your_cloud_name |
| CLOUDINARY_API_KEY | Cloudinary API key | 123456789 |
| CLOUDINARY_API_SECRET | Cloudinary API secret | your_api_secret |
| EMAIL_USER | Gmail address | email@gmail.com |
| EMAIL_PASS | Gmail app password | your_app_password |

---

## Development

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

---

## Notes for Frontend Developers

1. **Always include Authorization header** for protected routes
2. **Product images** are stored as URL strings in an array
3. **Order payment method** is COD only (no payment gateway integration)
4. **Review system** allows one review per user per product
5. **Categories** are required for products
6. **Admin role** is set manually in the database
7. **File uploads** go to Cloudinary (automatic)
8. **Email notifications** are sent on contact form submission

---

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── multer.js          # Multer configuration
├── controllers/           # Request handlers
├── middlewares/           # Auth & error middlewares
├── models/               # Mongoose schemas
├── routes/               # API routes
├── utils/                # Helper functions
├── .env                  # Environment variables
├── server.js             # Entry point
└── package.json          # Dependencies
```

---

## License

MIT

---

## Support

For issues or questions, contact: secretsclan2024@gmail.com