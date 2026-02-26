import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { orderAPI, productAPI, userAPI, categoryAPI } from '../../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    productsChange: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.all([
        orderAPI.getAll().catch(() => ({ data: [] })),
        productAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getAll().catch(() => ({ data: [] })),
        categoryAPI.getAll().catch(() => []),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data?.data || productsRes.data || [];
      const users = usersRes.data || [];
      const categories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);

      // Calculate total revenue and orders
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalProducts = products.length;

      // Calculate monthly revenue trends (last 6 months)
      const monthlyData = calculateMonthlyRevenue(orders);
      setRevenueData(monthlyData);

      // Calculate order status breakdown
      const statusBreakdown = calculateOrderStatus(orders);
      setOrderStatusData(statusBreakdown);

      // Calculate sales by category
      const categorySales = await calculateCategoryRevenue(orders, products, categories);
      setCategoryData(categorySales);

      // Calculate top products
      const topProductsList = calculateTopProducts(orders, products);
      setTopProducts(topProductsList);

      // Calculate percentage changes
      const changes = calculatePercentageChanges(orders, users, products);

      setStats({
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        revenueChange: changes.revenueChange,
        ordersChange: changes.ordersChange,
        usersChange: changes.usersChange,
        productsChange: changes.productsChange,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({
        key: monthKey,
        month: monthNames[date.getMonth()],
        revenue: 0,
        orders: 0,
      });
    }

    // Aggregate orders by month
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = last6Months.find(m => m.key === monthKey);
      if (monthData && !order.isCancelled) {
        monthData.revenue += order.totalAmount || 0;
        monthData.orders += 1;
      }
    });

    return last6Months.map(({ month, revenue, orders }) => ({
      month,
      revenue: Math.round(revenue),
      orders,
    }));
  };

  const calculateOrderStatus = (orders) => {
    const statusColors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      shipped: '#8B5CF6',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };

    const statusCount = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatus?.toLowerCase() || 'pending';
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: statusColors[status],
    }));
  };

  const calculateCategoryRevenue = async (orders, products, categories) => {
    const categoryColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#14B8A6', '#F97316'];
    const categorySales = {};

    // Initialize categories
    categories.forEach((category) => {
      categorySales[category._id] = {
        name: category.name,
        value: 0,
      };
    });

    // Build product to category map
    const productCategoryMap = {};
    products.forEach((product) => {
      if (product.category) {
        const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
        productCategoryMap[product._id] = categoryId;
      }
    });

    // Calculate revenue by category
    orders.forEach((order) => {
      if (!order.isCancelled && order.orderItems) {
        order.orderItems.forEach((item) => {
          const categoryId = productCategoryMap[item.productId];
          if (categoryId && categorySales[categoryId]) {
            categorySales[categoryId].value += (item.price * item.quantity) || 0;
          }
        });
      }
    });

    // Convert to array and sort by revenue
    const result = Object.values(categorySales)
      .filter(cat => cat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((cat, index) => ({
        ...cat,
        value: Math.round(cat.value),
        color: categoryColors[index % categoryColors.length],
      }));

    return result.length > 0 ? result : [{ name: 'No sales yet', value: 0, color: '#9CA3AF' }];
  };

  const calculateTopProducts = (orders, products) => {
    const productStats = {};

    // Initialize product stats
    products.forEach((product) => {
      productStats[product._id] = {
        name: product.name,
        sales: 0,
        revenue: 0,
      };
    });

    // Calculate sales and revenue per product
    orders.forEach((order) => {
      if (!order.isCancelled && order.orderItems) {
        order.orderItems.forEach((item) => {
          if (productStats[item.productId]) {
            productStats[item.productId].sales += item.quantity || 0;
            productStats[item.productId].revenue += (item.price * item.quantity) || 0;
          }
        });
      }
    });

    // Convert to array and get top 5
    const topList = Object.values(productStats)
      .filter(p => p.sales > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        ...p,
        revenue: Math.round(p.revenue),
      }));

    return topList.length > 0 ? topList : [
      { name: 'No sales yet', sales: 0, revenue: 0 }
    ];
  };

  const calculatePercentageChanges = (orders, users, products) => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Current month stats
    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= currentMonth && !o.isCancelled;
    });
    const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const currentMonthOrderCount = currentMonthOrders.length;

    const currentMonthUsers = users.filter(u => {
      const userDate = new Date(u.createdAt);
      return userDate >= currentMonth;
    }).length;

    const currentMonthProducts = products.filter(p => {
      const productDate = new Date(p.createdAt);
      return productDate >= currentMonth;
    }).length;

    // Last month stats
    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= lastMonth && orderDate < currentMonth && !o.isCancelled;
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lastMonthOrderCount = lastMonthOrders.length;

    const lastMonthUsers = users.filter(u => {
      const userDate = new Date(u.createdAt);
      return userDate >= lastMonth && userDate < currentMonth;
    }).length;

    const lastMonthProducts = products.filter(p => {
      const productDate = new Date(p.createdAt);
      return productDate >= lastMonth && productDate < currentMonth;
    }).length;

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : currentMonthRevenue > 0 ? 100 : 0;

    const ordersChange = lastMonthOrderCount > 0
      ? ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100).toFixed(1)
      : currentMonthOrderCount > 0 ? 100 : 0;

    const usersChange = lastMonthUsers > 0
      ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : currentMonthUsers > 0 ? 100 : 0;

    const productsChange = lastMonthProducts > 0
      ? ((currentMonthProducts - lastMonthProducts) / lastMonthProducts * 100).toFixed(1)
      : currentMonthProducts > 0 ? 100 : 0;

    return {
      revenueChange: parseFloat(revenueChange),
      ordersChange: parseFloat(ordersChange),
      usersChange: parseFloat(usersChange),
      productsChange: parseFloat(productsChange),
    };
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowUp className="text-green-500 mr-1" size={16} />
              ) : (
                <ArrowDown className="text-red-500 mr-1" size={16} />
              )}
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-white" size={28} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <TrendingUp className="text-green-500" size={20} />
          <span className="text-sm">Updated just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          change={stats.ordersChange}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts}
          change={stats.productsChange}
          color="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue Trend (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
              <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) =>
                  count > 0 ? `${status} (${count})` : ''
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
              <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Products
          </h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Monthly Overview
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
            <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
            <YAxis yAxisId="left" className="text-gray-600 dark:text-gray-400" />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboardPage;