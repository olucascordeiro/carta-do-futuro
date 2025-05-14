export interface User {
  id: string;
  email: string; // Mantém o email
  name: string | null; // <<< ADICIONAR ESTA LINHA
  phone: string | null; // <<< ADICIONAR ESTA LINHA
  planType: 'none' | 'basic' | 'full'; // Novo
  accessExpiresAt: Date | null;         // Novo
  purchasedAt: Date | null;               // Novo (ou Date se sempre definido após compra)
}

export interface Letter {
  id: string;
  userId: string;
  title: string; // Ou string | null se o título for opcional no DB
  body: string;  // Era message
  mediaUrl?: string | null;
  deliveryDate: Date; // Era scheduled_date no DB, mapeado no frontend
  status: 'scheduled' | 'delivered' | 'failed'; // Mapeado dos status do DB
  createdAt: Date;
}


export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}