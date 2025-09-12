# POS System with Loyalty Program

A complete full-stack Point of Sale system with customer loyalty features, built with React, Express.js, and PostgreSQL.

**Author:** Rodrigo Torres  
**Version:** 1.0.0  
**Created:** January 11, 2025

## 🚀 Features

### 🛒 Point of Sale
- Product catalog with search and filtering
- Shopping cart with quantity controls
- Multiple payment methods (Cash, Card, Mobile)
- Real-time tax calculation (8%)
- Receipt generation

### 🏆 Loyalty System
- Customer search by loyalty number or name/email
- Automatic customer creation during checkout
- Points tracking (1 point per dollar spent)
- Complete purchase history with product details
- Customer analytics (total spent, visit count, points)

### 📦 Inventory Management
- Add, edit, and delete products
- Stock level tracking with low-stock alerts
- Category management
- Automatic stock updates after sales

### 📊 Sales Analytics
- Daily and total sales tracking
- Transaction history
- Customer metrics
- Performance dashboard

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Heroku CLI (for deployment)
- Git

## Default admin user
username: admin
password: P@$$word1

## Deploy to Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/rt-heroku/pos-demo)

## 🛠️ Local Setup

### 1. Clone or Create Project
```bash
mkdir pos-system
cd pos-system
mkdir public
```

### 2. Copy Files
Create the following files and copy the content from the artifacts:

```
pos-system/
├── Procfile
├── package.json
├── server.js
├── database.sql
├── .env
├── public/
│   ├── index.html
│   └── app.js
└── README.md
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Database
```bash
# Create database
createdb pos_db

# Run schema
psql pos_db < database.sql
```

### 5. Configure Environment
Edit `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
PORT=3000
NODE_ENV=development
```

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 🌐 Heroku Deployment

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create Heroku App
```bash
heroku create your-pos-app-name
```

### 3. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:essential-0
```

### 4. Set Up Database Schema
```bash
heroku pg:psql < database.sql
```

### 5. Deploy Application
```bash
git push heroku main
```

### 6. Open Your App
```bash
heroku open
```

## 📚 Usage Guide

### Adding Loyalty Customers During Checkout

1. **In POS View**: Click "Add Loyalty Customer" in the cart
2. **Search Options**:
   - Enter loyalty number (e.g., LOY001)
   - Search by customer name or email
3. **New Customer**: If not found, system prompts to create new customer
4. **Automatic Benefits**: Points earned automatically (1 point per dollar)

### Customer Management

1. **Go to Loyalty Tab**: Search and manage customers
2. **View History**: Click "View History" to see complete purchase records
3. **Customer Analytics**: See points, total spent, visit count

### Inventory Management

1. **Add Products**: Use the form to add new items
2. **Edit Products**: Click edit icon in product table
3. **Stock Alerts**: Products with ≤5 items show red alert
4. **Auto Updates**: Stock decreases automatically after sales

## 🎯 Loyalty System Features

### Customer Search
- **By Loyalty Number**: LOY001, LOY002, etc.
- **By Name/Email**: Partial matching supported
- **Real-time Results**: Instant search as you type

### Purchase History
- **Complete Transaction Details**: Date, items, quantities, prices
- **Points Tracking**: Points earned per transaction
- **Payment Methods**: Cash, card, mobile payment records

### Points System
- **Earning**: 1 point per dollar spent
- **Tracking**: Real-time balance updates
- **History**: View all points earned per transaction

## 🔧 API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers/Loyalty
- `GET /api/customers` - List all customers
- `GET /api/customers/loyalty/:loyaltyNumber` - Find by loyalty number
- `GET /api/customers/search/:query` - Search customers
- `GET /api/customers/:id/history` - Get purchase history
- `POST /api/customers` - Create new customer
- `POST /api/loyalty/create` - Create customer with loyalty number

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/analytics` - Get sales analytics

## 🗄️ Database Schema

### Tables
- **products**: Product catalog with stock tracking
- **customers**: Customer information with loyalty data
- **transactions**: Sales transactions with payment details
- **transaction_items**: Individual items per transaction

### Key Features
- **Auto-generated loyalty numbers**: LOY001, LOY002, etc.
- **Automatic triggers**: Update customer stats after each transaction
- **Data integrity**: Foreign key constraints and cascading deletes
- **Performance indexes**: Optimized queries for search and reporting

## 🎨 Tech Stack

### Frontend
- **React 18**: Component-based UI
- **Tailwind CSS**: Utility-first styling
- **Babel**: JSX transformation
- **Custom Icons**: SVG-based icon system

### Backend
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **Node.js**: Runtime environment
- **CORS**: Cross-origin resource sharing

### Deployment
- **Heroku**: Cloud platform
- **Heroku Postgres**: Managed database service

## 🔒 Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pos_db
```

### Optional Variables
```env
PORT=3000
NODE_ENV=development
```

### Heroku Variables
Heroku automatically sets `DATABASE_URL` when you add the PostgreSQL addon.

## 📊 Sample Data

The system comes pre-loaded with:
- **10 sample products** (coffee, sandwiches, etc.)
- **4 sample customers** with loyalty numbers
- **Sample transactions** with purchase history
- **Points and analytics data**

## 🛡️ Error Handling

### Frontend
- API error handling with user-friendly messages
- Loading states for all async operations
- Form validation and required field checks
- Graceful fallbacks for missing data

### Backend
- Database connection error handling
- Transaction rollback on failures
- Input validation and sanitization
- Proper HTTP status codes

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify database exists
psql -l | grep pos_db
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Development Tips

**Reset Database**
```bash
# Drop and recreate database
dropdb pos_db
createdb pos_db
psql pos_db < database.sql
```

**View Logs**
```bash
# Local development
npm run dev

# Heroku logs
heroku logs --tail
```

## 🚀 Performance Optimization

### Database
- Indexed loyalty numbers for fast customer lookup
- Efficient transaction queries with JOINs
- Optimized search with LIKE operators

### Frontend
- React key props for efficient rendering
- Debounced search inputs
- Lazy loading for large datasets

## 🔮 Future Enhancements

### Potential Features
- **Barcode scanning** for products
- **Advanced reporting** with charts
- **Email receipts** to customers
- **Inventory alerts** via notifications
- **Multi-location support**
- **Employee management**
- **Discount system**
- **Return/refund handling**

### Technical Improvements
- **TypeScript** for better type safety
- **React Query** for data fetching
- **WebSocket** for real-time updates
- **PWA** for offline functionality

## 📞 Support

### Issues
If you encounter any problems:
1. Check the browser console for errors
2. Verify all files are copied correctly
3. Ensure PostgreSQL is running
4. Check environment variables

### Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql)

## 📄 License

MIT License - feel free to use this project for your business needs.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a complete POS solution.