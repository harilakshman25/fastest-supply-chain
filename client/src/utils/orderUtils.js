export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  };
  
  export const getStatusBadgeClass = status => {
    switch(status) {
      case ORDER_STATUS.PENDING:
        return 'bg-warning';
      case ORDER_STATUS.PROCESSING:
        return 'bg-info';
      case ORDER_STATUS.PICKED_UP:
        return 'bg-primary';
      case ORDER_STATUS.IN_TRANSIT:
        return 'bg-primary';
      case ORDER_STATUS.DELIVERED:
        return 'bg-success';
      case ORDER_STATUS.CANCELLED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  export const formatStatus = status => {
    return status.replace('_', ' ').toUpperCase();
  };
  
  export const getNextStatuses = currentStatus => {
    switch(currentStatus) {
      case ORDER_STATUS.PENDING:
        return [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.PROCESSING:
        return [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.PICKED_UP:
        return [ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.IN_TRANSIT:
        return [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.CANCELLED:
        return [];
      default:
        return [];
    }
  };
  