export type BaseResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errorCode?: string;
  /** Sunucu logları ile eşleştirmek için (hata yanıtlarında) */
  traceId?: string;
};

export type AuthPayload = {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
};

export type Product = {
  id: number;
  productName: string;
  unitPrice: number;
  unitInStock: number;
  quantityPerUnit: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
  imageUrl?: string;
  discount: number;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
};

export type PagedProducts = {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type Category = {
  id: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubCategory = {
  id: number;
  subCategoryName: string;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  discount: number;
  imageUrl?: string;
  backgroundColor?: string;
  timeLeft?: string;
  buttonText?: string;
  buttonHref?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Cart = {
  userId: number;
  items: CartItem[];
  totalItems: number;
  /** Ürün ara toplamı (kargo öncesi) */
  totalAmount: number;
  shippingFee: number;
  grandTotal: number;
  freeShippingRemainingTry?: number | null;
};

export type CartItem = {
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
};

export type Address = {
  id: number;
  userId: number;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = {
  id: number;
  userId: number;
  type: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotalAmount?: number;
  shippingFee?: number;
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Favorite = {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  productPrice: number;
  productDiscount?: number;
  productCategory?: string;
  productInStock: boolean;
  createdAt: string;
};

export type Review = {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  title?: string;
  isVerified: boolean;
  isHelpful: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  productName?: string;
};

export type ProductReviewSummary = {
  productId: number;
  averageRating: number;
  totalReviews: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
};

export type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSummary = {
  totalNotifications: number;
  unreadNotifications: number;
  recentNotifications: Notification[];
};

export type UserSettings = {
  userId: number;
  language: string;
  timezone: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  stockNotifications: boolean;
  theme: string;
  itemsPerPage: number;
  autoSaveCart: boolean;
  showProductRecommendations: boolean;
  enableLocationServices: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PrivacySettings = {
  userId: number;
  profileVisibility: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  allowAnalytics: boolean;
  allowCookies: boolean;
  allowMarketing: boolean;
  dataSharing: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SecurityInfo = {
  userId: number;
  email: string;
  isEmailVerified: boolean;
  lastPasswordChange?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  recentLogins: LoginHistory[];
};

export type LoginHistory = {
  id: number;
  loginAt: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  isSuccessful: boolean;
};

export type SecuritySettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  twoFactorRequired: boolean;
  sessionTimeout: number;
};

export type HelpArticle = {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicket = {
  id: number;
  userId: number;
  userName: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

export type SupportMessage = {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  message: string;
  isFromSupport: boolean;
  createdAt: string;
};
