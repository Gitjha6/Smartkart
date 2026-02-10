# SmartKart - E-commerce Platform

A full-stack e-commerce application built with React, Node.js, and MongoDB.

## 🚀 Features

### Core Features
- **User Authentication**: Signup, login, JWT-based sessions, password encryption
- **Product Catalog**: Add, update, delete, search, filter, pagination
- **Shopping Cart**: Add/remove items, update quantity, total price calculation
- **Checkout & Orders**: Order management with Stripe payment integration
- **Admin Panel**: Manage products, users, and orders
- **Responsive UI**: Modern design with Tailwind CSS

### Advanced Features
- **Wishlist**: Save favorite products
- **Product Reviews**: Rating and review system
- **Search Suggestions**: Auto-complete search functionality
- **Invoice Generation**: PDF invoice for completed orders

## 🏗️ Project Structure

```
SmartKart/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── features/       # Redux Toolkit slices
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Stripe** for payments
- **Multer** for file uploads
- **Joi** for validation

### Development Tools
- **ESLint** and **Prettier** for code formatting
- **Husky** for git hooks
- **Jest** for testing
- **Docker** for containerization

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartKart
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   cd backend
   cp .env.example .env
   # Edit .env with your configuration

   # Frontend (.env)
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm start
   ```

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartkart
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🗄️ Database Schema

### Users
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (enum: 'customer', 'admin')
- `avatar`: String (URL)
- `address`: Object
- `phone`: String
- `createdAt`: Date
- `updatedAt`: Date

### Products
- `_id`: ObjectId
- `name`: String
- `description`: String
- `price`: Number
- `category`: String
- `images`: Array of Strings
- `stock`: Number
- `rating`: Number
- `reviews`: Array of Review objects
- `createdAt`: Date
- `updatedAt`: Date

### Orders
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `items`: Array of OrderItem objects
- `totalAmount`: Number
- `status`: String (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- `paymentStatus`: String (enum: 'pending', 'completed', 'failed')
- `shippingAddress`: Object
- `paymentMethod`: String
- `stripePaymentIntentId`: String
- `createdAt`: Date
- `updatedAt`: Date

### Cart
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `items`: Array of CartItem objects
- `totalAmount`: Number
- `createdAt`: Date
- `updatedAt`: Date

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/stats` - Get dashboard stats (admin only)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Set environment variables in the deployment platform

### Backend (Render/Heroku)
1. Ensure `package.json` has proper start script
2. Set environment variables in the deployment platform
3. Deploy to Render or Heroku

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update the `MONGODB_URI` environment variable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@smartkart.com or create an issue in the repository.
