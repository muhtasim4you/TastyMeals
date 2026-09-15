# TastyMeals

TastyMeals is a full-stack food delivery and restaurant management platform built for Bangladesh. It supports customer ordering, restaurant management, merchant dashboards, admin oversight, promotions, rewards, support tickets, and food waste reduction initiatives.

## Overview

This project includes:

- Customer food ordering and checkout flow
- Restaurant discovery and search
- Cart, wishlist, rewards, and notifications
- Merchant dashboard for menu and restaurant management
- Admin control panel for users, orders, restaurants, promos, charities, and support
- Food wastage tracking and donation workflows
- Job postings and application management
- Diet planning and support features

## Tech Stack

### Frontend
- React
- React Router DOM
- Axios
- React Hot Toast
- React Icons
- CSS modules / custom CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt password hashing
- Multer for file uploads

## Project Structure

```text
TastyMeals/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── seed.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm
- MongoDB running locally
- A terminal or command prompt

## Environment Setup

Create a `.env` file inside the `backend` folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tastymeals
JWT_SECRET=your_super_secret_key_here
```

A sample environment is already present in `backend/.env` for local development.

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running the Project

### Start the backend

```bash
cd backend
npm start
```

The backend API will run on:

- http://localhost:5000

### Start the frontend

```bash
cd frontend
npm start
```

The frontend app will run on:

- http://localhost:3000

## Seeded Admin Account

The app seeds a default admin user for local testing.

- Email: admin@tastymeals.com
- Password: admin123

This is defined in `backend/seed.js`.

## Default Demo Behavior

This project currently includes demo/mock payment options such as:

- Bkash
- Nagad
- Bank transfer

The checkout flow accepts payment details and stores them as order metadata, but it is not connected to a real gateway SDK or live payment processor.

## Features Included

### Customer Features
- Browse restaurants and menu items
- Search food and restaurants
- Add items to cart
- Apply promo codes
- Redeem loyalty rewards
- Place orders with payment selection
- View order history and tracking
- Submit reviews and ratings
- Access food wastage notification updates
- Use support ticket system
- Generate diet plans

### Merchant Features
- Register restaurant
- Manage menu items
- Donate surplus food to partner charities
- Log food wastage and view analytics
- Create job postings and review applications

### Admin Features
- Manage users, restaurants, and orders
- Review donations and charity partners
- Manage notifications and promo codes
- Monitor wastage data
- Review customer support tickets
- Configure delivery fee and VAT settings

## Notes

- The project is designed as a local demo/full-stack prototype.
- Some flows are intentionally mock/demo-based for learning and portfolio work.
- If you want real payment processing, you would need to integrate a real gateway such as Bkash API, SSLCommerz, or a similar provider.

## License

This project is for educational and demonstration purposes.

## Developer Notes

To keep development smooth:

- Run backend and frontend in separate terminals.
- Ensure MongoDB is running before starting the backend.
- Seed data is created through the backend setup flow.

If you want, I can also generate a more polished version of this README for GitHub, including badges, screenshots, and a deployment section.
