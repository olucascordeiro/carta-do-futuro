export interface User {
  id: string;
  email: string;
  isSubscriber: boolean;
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | null;
}

export interface Letter {
  id: string;
  userId: string;
  title: string;
  body: string;
  mediaUrl?: string;
  deliveryDate: Date;
  status: 'scheduled' | 'delivered' | 'expired';
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}