# requirements.md

## Project Title

SecretsClan E-Commerce Website

## 1. Overview

SecretsClan is a Pakistan-based e-commerce website designed to sell watches, hoodies, perfumes, and printed shirts to local customers. The platform is built using the MERN stack and supports Cash on Delivery as the only payment method.

## 2. Business Goals

* Establish an online presence for SecretsClan
* Allow customers to browse and purchase products easily
* Enable admin to manage products and orders efficiently

## 3. User Roles

### 3.1 Customer

Customers can:

* Register and log in
* Browse products by category
* View product details
* Add and remove items from cart
* Place orders using Cash on Delivery
* View order history and order status
* Submit product reviews
* Contact support

### 3.2 Admin

Admins can:

* Log in securely
* Create, update, and delete products
* Manage product categories
* View and manage customer orders
* Update order status
* View registered users
* Create basic product offers
* View customer contact messages

## 4. Functional Requirements

### 4.1 Authentication

* User registration with email and password
* User login and logout
* JWT-based authentication
* Admin-protected routes

### 4.2 Product Management

* Product attributes include name, price, description, category, variants, images, and reviews
* Product images are stored and served using Cloudinary

### 4.3 Cart

* Add products to cart
* Remove products from cart
* Update product quantities

### 4.4 Orders

* Place orders using Cash on Delivery
* Generate unique order ID
* Track order status (Pending, Confirmed, Shipped, Delivered, Cancelled)

### 4.5 Reviews

* Logged-in users can submit product reviews
* Admin can delete reviews if required

### 4.6 Contact & Support

* Contact form with name, email, and message
* Messages are stored in the database
* Notification email sent to admin

## 5. Non-Functional Requirements

* Secure password storage
* Responsive UI
* Reliable data storage
* Basic performance optimization

## 6. Technical Stack

* Frontend: React
* Backend: Node.js with Express
* Database: MongoDB
* Image Storage: Cloudinary

## 7. Constraints

* Cash on Delivery only
* No online payment gateways
* No automated refunds or shipping APIs
* Development timeline: 2 weeks
