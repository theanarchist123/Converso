"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastSignInAt: string;
  banned: boolean;
  imageUrl: string;
}

interface Analytics {
  overview: {
    totalUsers: number;
    totalSessions: number;
    averageSessionTime: string;
    activeUsersToday: number;
  };
  userGrowth: Array<{
    date: string;
    users: number;
    sessions: number;
  }>;
  topMetrics: {
    mostActiveHour: string;
    popularFeatures: Array<{ name: string; usage: string }>;
    retentionRate: string;
  };
  recentActivity: Array<{
    action: string;
    time: string;
    user: string;
  }>;
}

interface Companion {
  id: string;
  name: string;
  description: string;
  category: string;
  userId: string;
  createdAt: string;
  status: string;
  reportCount: number;
  isPublic: boolean;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const router = useRouter();

  useEffect(() => {
    const validateAndSetAdmin = async () => {
      // Check if admin is logged in
      const adminData = localStorage.getItem('admin');
      const token = localStorage.getItem('admin_token');

      if (!adminData || !token) {
        router.push('/admin/login');
        return;
      }

      try {
        // Validate token by making a test request
        const response = await fetch('/api/admin/test-auth', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          console.log('Token validation failed, redirecting to login');
          localStorage.removeItem('admin');
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }

        const testResult = await response.json();
        if (!testResult.step4_final?.success) {
          console.log('Token validation failed, redirecting to login');
          localStorage.removeItem('admin');
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }

        setAdmin(JSON.parse(adminData));
        setIsLoading(false);
      } catch (error) {
        console.log('Token validation error:', error);
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      }
    };

    validateAndSetAdmin();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      // Continue with logout even if API call fails
    }

    localStorage.removeItem('admin');
    localStorage.removeItem('admin_token');
    
    // Redirect to login
    router.push('/admin/login');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'moderator': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Fetch users data
  useEffect(() => {
    if (admin && activeTab === 'users') {
      fetchUsers();
    }
  }, [admin, activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch analytics data
  useEffect(() => {
    if (admin && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [admin, activeTab]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch companions data
  useEffect(() => {
    if (admin && activeTab === 'companions') {
      fetchCompanions();
    }
  }, [admin, activeTab]);

  const fetchCompanions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/companions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setCompanions(data.companions || []);
      }
    } catch (error) {
      console.error('Error fetching companions:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action })
      });

      if (response.ok) {
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleCompanionAction = async (companionId: string, action: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/companions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companionId, action })
      });

      if (response.ok) {
        fetchCompanions(); // Refresh companions list
      }
    } catch (error) {
      console.error('Error performing companion action:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'companions', name: 'Companions', icon: '🤖' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Admin Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {admin.firstName} {admin.lastName}
                </p>
                <p className="text-xs text-gray-600">{admin.email}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                  {formatRole(admin.role)}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Admin Dashboard</h3>
                <p className="text-gray-600">
                  Hello {admin.firstName}! You have <strong>{admin.role}</strong> access.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Use the tabs above to manage users, view analytics, and moderate companions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage and moderate platform users</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={user.imageUrl || '/default-avatar.png'} alt="" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {!user.banned ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'ban')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'unban')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Unban
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {analytics && (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">👥</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-gray-900">{analytics.overview.totalUsers}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📊</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                          <dd className="text-lg font-medium text-gray-900">{analytics.overview.totalSessions}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">⏱️</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Session Time</dt>
                          <dd className="text-lg font-medium text-gray-900">{analytics.overview.averageSessionTime}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🔥</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Today</dt>
                          <dd className="text-lg font-medium text-gray-900">{analytics.overview.activeUsersToday}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity */}
            {analytics && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">by {activity.user}</p>
                        </div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Companions Tab */}
        {activeTab === 'companions' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Companion Moderation</h3>
                <p className="text-sm text-gray-600">Moderate and manage AI companions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Companion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companions.map((companion) => (
                      <tr key={companion.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{companion.name}</div>
                            <div className="text-sm text-gray-500">{companion.description}</div>
                            <div className="text-xs text-gray-400">{companion.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            companion.status === 'active' ? 'bg-green-100 text-green-800' :
                            companion.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {companion.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {companion.reportCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(companion.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleCompanionAction(companion.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCompanionAction(companion.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleCompanionAction(companion.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}