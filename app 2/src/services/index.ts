// Services exports

export { offlineQueue, useOfflineQueue } from './offlineQueue';
export { bulkOrderService } from './bulkOrder';
export { recommendationEngine, useRecommendations } from './recommendationEngine';
export { invoicePDFService } from './invoicePDF';
export { dataManager, useDataManager } from './dataManager';
export { stockNotification, useStockNotification } from './stockNotification';
export { reviewSystem, useReviewSystem } from './reviewSystem';
export { subscriptionService, useSubscription } from './subscription';
export { priceAlertService, usePriceAlert } from './priceAlert';
export { shippingTracker, useShippingTracker } from './shippingTracker';
export { b2bPricing, useB2BPricing } from './b2bPricing';

// Re-export types
export type { QueuedAction, QueueActionType, SyncResult } from './offlineQueue';
export type { BulkOrderItem, ParseResult } from './bulkOrder';
export type { Recommendation, Product as RecommendationProduct } from './recommendationEngine';
export type { InvoiceData, QuoteData } from './invoicePDF';
export type { DataBackup, ExportOptions, ImportResult } from './dataManager';
export type { StockAlert, StockAlertInput } from './stockNotification';
export type { Review, ReviewInput, ReviewStats } from './reviewSystem';
export type { 
  Subscription, 
  SubscriptionInput, 
  SubscriptionItem,
  SubscriptionFrequency 
} from './subscription';
export type { PriceAlert, PriceAlertInput, PriceHistory } from './priceAlert';
export type { 
  Shipment, 
  ShipmentStatus, 
  ShipmentEvent,
  ShippingCompany,
  TrackingResult 
} from './shippingTracker';
export type { 
  B2BCustomer, 
  CustomerGroup,
  B2BPriceList,
  B2BQuote,
  B2BQuoteItem 
} from './b2bPricing';
