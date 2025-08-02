import config from '../config/env';

const API_BASE_URL = config.API_URL;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  tickets?: any[];
  categories?: any[];
  tags?: any[];
  notifications?: any[];
  replies?: any[];
  attachments?: any[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  unread_count?: number;
  urgent_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  profile_picture?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: any;
  priority: string;
  status: string;
  author: User;
  assigned_to?: User;
  tags?: any[];
  reply_count: number;
  created_at: string;
  updated_at: string;
  is_urgent?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  category_id: string;
  priority: string;
  is_urgent?: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
}

export interface Tag {
  id: string;
  name: string;
  category: Category;
  color: string;
  is_active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  ticket_id?: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private getMultipartHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Auth Endpoints
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return response.json();
  }

  async login(data: LoginData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }
    
    return response.json();
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send reset email');
    }
    
    return response.json();
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
  }

  // Ticket Endpoints
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
  }): Promise<ApiResponse<Ticket[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/tickets?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch tickets');
    }
    
    return response.json();
  }





  async deleteCategory(categoryId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: "Category deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to delete category",
      };
    }
  }

  // Tag Management
  async getTags(): Promise<ApiResponse<Tag[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.tags || data.data || [],
        message: "Tags retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching tags:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch tags",
      };
    }
  }

  async createTag(tagData: any): Promise<ApiResponse<Tag>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.tag || data,
        message: "Tag created successfully",
      };
    } catch (error) {
      console.error("Error creating tag:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to create tag",
      };
    }
  }

  async updateTag(tagId: string, tagData: any): Promise<ApiResponse<Tag>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.tag || data,
        message: "Tag updated successfully",
      };
    } catch (error) {
      console.error("Error updating tag:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to update tag",
      };
    }
  }

  async deleteTag(tagId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: "Tag deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting tag:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to delete tag",
      };
    }
  }
  async getStaffStats(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${userId}/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.stats || data,
        message: "Staff stats retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching staff stats:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to fetch staff stats",
      };
    }
  }

  async assignTicket(ticketId: string, agentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ assigned_to: agentId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: "Ticket assigned successfully",
      };
    } catch (error) {
      console.error("Error assigning ticket:", error);
      return {
        success: false,
        data: undefined,
        message: "Failed to assign ticket",
      };
    }
  }
  async createTicket(data: CreateTicketData): Promise<ApiResponse<Ticket>> {
    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create ticket');
    }
    
    return response.json();
  }

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch ticket');
    }
    
    return response.json();
  }

  async updateTicket(id: string, data: Partial<CreateTicketData>): Promise<ApiResponse<Ticket>> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update ticket');
    }
    
    return response.json();
  }

  async addTicketReply(ticketId: string, data: {
    content: string;
    reply_type?: string;
    is_solution?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/replies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add reply');
    }
    
    return response.json();
  }

  async pickupTicket(ticketId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/pickup`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to pickup ticket');
    }
    
    return response.json();
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch categories');
    }
    
    return response.json();
  }

  async createCategory(data: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create category');
    }
    
    return response.json();
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update category');
    }
    
    return response.json();
  }

  // Tags

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notifications');
    }
    
    return response.json();
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark notification as read');
    }
    
    return response.json();
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark all notifications as read');
    }
    
    return response.json();
  }

  // File Attachments
  async uploadTicketAttachment(ticketId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/attachments/tickets/${ticketId}/upload`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload attachment');
    }
    
    return response.json();
  }

  async getTicketAttachments(ticketId: string): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/attachments/tickets/${ticketId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch attachments');
    }
    
    return response.json();
  }

  // Role Upgrade Requests
  async submitUpgradeRequest(data: {
    requested_role: string;
    reason: string;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/upgrade-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit upgrade request');
    }
    
    return response.json();
  }

  async getMyUpgradeRequests(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/upgrade-requests/my`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch upgrade requests');
    }
    
    return response.json();
  }

  // Admin endpoints
  async getAdminUpgradeRequests(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/upgrade-requests`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch upgrade requests');
    }
    
    return response.json();
  }

  async approveUpgradeRequest(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/upgrade-requests/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve upgrade request');
    }
    
    return response.json();
  }

  async rejectUpgradeRequest(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/upgrade-requests/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject upgrade request');
    }
    
    return response.json();
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    
    return response.json();
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user role');
    }
    
    return response.json();
  }

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user status');
    }
    
    return response.json();
  }

  // Dashboard
  async getUserDashboard(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user dashboard');
    }
    
    return response.json();
  }

  async getStaffDashboard(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/staff`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch staff dashboard');
    }
    
    return response.json();
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin dashboard');
    }
    
    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('authToken') !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const apiService = new ApiService();