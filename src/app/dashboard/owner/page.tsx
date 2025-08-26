"use client"

import React, { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Building2, DollarSign, MapPin, 
  Calendar, Eye, Star, Award, Phone, Mail, Clock, ArrowUp, ArrowDown,
  Home, Search, Filter, MoreVertical, ChevronRight, Bell, MessageSquare,
  Target, PieChart, BarChart3, Activity, Briefcase, Shield, Globe,
  Camera, Video, FileText, Calculator, Zap, Heart, CheckCircle
} from 'lucide-react'

const DashboardHome = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Key Metrics Data
  const keyMetrics = [
    {
      title: "Total Revenue",
      value: "$2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Properties Sold",
      value: "47",
      change: "+8.2%", 
      trend: "up",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Clients",
      value: "234",
      change: "+15.3%",
      trend: "up", 
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Market Share",
      value: "18.5%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50", 
      textColor: "text-yellow-600"
    }
  ]

  // Recent Properties Data
  const recentProperties = [
    {
      id: 1,
      title: "Luxury Villa Nyarutarama",
      location: "Nyarutarama, Kigali",
      price: "$650,000",
      status: "sold",
      image: "/api/placeholder/300/200",
      bedrooms: 5,
      bathrooms: 4,
      sqft: "4,200 sqft",
      soldDate: "2 days ago",
      agent: "Marine Ndisanze"
    },
    {
      id: 2, 
      title: "Modern Apartment Kimihurura",
      location: "Kimihurura, Kigali",
      price: "$280,000",
      status: "pending",
      image: "/api/placeholder/300/200", 
      bedrooms: 3,
      bathrooms: 2,
      sqft: "1,800 sqft",
      listDate: "1 week ago",
      agent: "John Uwimana"
    },
    {
      id: 3,
      title: "Commercial Building CBD",
      location: "Kigali CBD",
      price: "$1,200,000", 
      status: "available",
      image: "/api/placeholder/300/200",
      bedrooms: 0,
      bathrooms: 6,
      sqft: "8,500 sqft",
      listDate: "3 days ago",
      agent: "Sarah Mukamana"
    }
  ]

  // Recent Activities Data
  const recentActivities = [
    {
      id: 1,
      type: "sale",
      title: "Property sold in Nyarutarama",
      description: "5-bedroom villa sold for $650,000",
      time: "2 hours ago",
      icon: Home,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "meeting", 
      title: "Client meeting scheduled",
      description: "Investment consultation with David Chen",
      time: "4 hours ago",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "listing",
      title: "New property listed",
      description: "Modern apartment in Kimihurura added",
      time: "1 day ago",
      icon: Building2,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "inquiry",
      title: "Property inquiry received", 
      description: "International client interested in commercial plot",
      time: "2 days ago",
      icon: MessageSquare,
      color: "text-yellow-600"
    }
  ]

  // Market Insights Data
  const marketInsights = [
    {
      location: "Nyarutarama",
      avgPrice: "$580K",
      growth: "+15.2%",
      properties: 23
    },
    {
      location: "Kimihurura", 
      avgPrice: "$320K",
      growth: "+12.8%",
      properties: 45
    },
    {
      location: "Kiyovu",
      avgPrice: "$420K", 
      growth: "+9.5%",
      properties: 18
    },
    {
      location: "Remera",
      avgPrice: "$180K",
      growth: "+18.3%", 
      properties: 67
    }
  ]

  // Performance Data
  const performanceData = [
    { month: 'Jan', sales: 32, revenue: 1850000 },
    { month: 'Feb', sales: 28, revenue: 1650000 },
    { month: 'Mar', sales: 45, revenue: 2200000 },
    { month: 'Apr', sales: 38, revenue: 1950000 },
    { month: 'May', sales: 52, revenue: 2450000 },
    { month: 'Jun', sales: 47, revenue: 2300000 }
  ]

  const getStatusColor = (status:any) => {
    switch (status) {
      case 'sold': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800' 
      case 'available': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 via-yellow-500 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Marine!</h1>
            <p className="text-green-100">
              Here's your Zola Real Estate performance overview for today
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <Home className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-sm text-green-100">Today's Appointments</div>
            <div className="text-xl font-bold">8</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-sm text-green-100">New Inquiries</div>
            <div className="text-xl font-bold">5</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-sm text-green-100">Properties Viewed</div>
            <div className="text-xl font-bold">127</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">{metric.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end space-x-2">
            {performanceData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-md hover:from-green-600 hover:to-green-400 transition-colors cursor-pointer"
                     style={{ height: `${(data.sales / 60) * 100}%` }}>
                </div>
                <div className="text-xs text-gray-600 mt-2">{data.month}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Properties Sold</span>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Market Insights</h3>
            <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{insight.location}</div>
                    <div className="text-sm text-gray-600">{insight.properties} properties</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{insight.avgPrice}</div>
                  <div className="text-sm text-green-600 font-semibold">{insight.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Properties</h3>
          <button className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center">
            View All Properties <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <div key={property.id} className="group cursor-pointer">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg h-40 mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                    {property.status.toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="flex items-center space-x-2 text-sm">
                    <Home className="w-4 h-4" />
                    <span>{property.bedrooms} bed</span>
                    <span>•</span>
                    <span>{property.bathrooms} bath</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                  {property.title}
                </h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">{property.price}</span>
                  <span className="text-sm text-gray-500">{property.sqft}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Agent: {property.agent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
            <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${activity.color === 'text-green-600' ? 'bg-green-100' : 
                  activity.color === 'text-blue-600' ? 'bg-blue-100' : 
                  activity.color === 'text-purple-600' ? 'bg-purple-100' : 'bg-yellow-100'}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <Building2 className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-gray-900">Add Property</div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-gray-900">New Client</div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-gray-900">Schedule Tour</div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-yellow-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all group">
              <BarChart3 className="w-8 h-8 text-yellow-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-gray-900">View Reports</div>
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-800">Pro Tip</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Schedule property tours during peak viewing hours (10 AM - 4 PM) to maximize client engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4.9</div>
          <div className="text-sm text-gray-600">Client Rating</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Awards Won</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">100%</div>
          <div className="text-sm text-gray-600">Secure Deals</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Globe className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">25+</div>
          <div className="text-sm text-gray-600">Countries Served</div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome