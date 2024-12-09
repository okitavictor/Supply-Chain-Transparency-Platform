import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock contract state
let contractState: {
  payments: Record<number, any>;
  nextPaymentId: number;
} = {
  payments: {},
  nextPaymentId: 0
};

// Mock contract calls
const mockContractCall = vi.fn();

// Helper function to reset state before each test
function resetState() {
  contractState = {
    payments: {},
    nextPaymentId: 0
  };
}

describe('Payment Contract', () => {
  beforeEach(() => {
    resetState();
    vi.resetAllMocks();
  });
  
  it('should create a payment', () => {
    mockContractCall.mockImplementation(() => {
      const paymentId = contractState.nextPaymentId;
      contractState.payments[paymentId] = {
        product_id: 0,
        amount: 1000,
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        paid: false
      };
      contractState.nextPaymentId++;
      return { success: true, value: paymentId };
    });
    
    const result = mockContractCall('create-payment', 0, 1000, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ success: true, value: 0 });
    expect(contractState.payments[0]).toBeDefined();
    expect(contractState.payments[0].amount).toBe(1000);
  });
  
  it('should make a payment', () => {
    // Setup initial state
    contractState.payments[0] = {
      product_id: 0,
      amount: 1000,
      recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      paid: false
    };
    
    mockContractCall.mockImplementation(() => {
      const [paymentId] = mockContractCall.mock.calls[0].slice(1);
      if (contractState.payments[paymentId].paid) {
        return { success: false, error: 403 };
      }
      contractState.payments[paymentId].paid = true;
      return { success: true };
    });
    
    const result = mockContractCall('make-payment', 0);
    expect(result).toEqual({ success: true });
    expect(contractState.payments[0].paid).toBe(true);
  });
  
  it('should not allow double payment', () => {
    // Setup initial state
    contractState.payments[0] = {
      product_id: 0,
      amount: 1000,
      recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      paid: true
    };
    
    mockContractCall.mockImplementation(() => {
      const [paymentId] = mockContractCall.mock.calls[0].slice(1);
      if (contractState.payments[paymentId].paid) {
        return { success: false, error: 403 };
      }
      contractState.payments[paymentId].paid = true;
      return { success: true };
    });
    
    const result = mockContractCall('make-payment', 0);
    expect(result).toEqual({ success: false, error: 403 });
  });
  
  it('should retrieve payment information', () => {
    // Setup initial state
    contractState.payments[0] = {
      product_id: 0,
      amount: 1000,
      recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      paid: false
    };
    
    mockContractCall.mockImplementation(() => {
      const [paymentId] = mockContractCall.mock.calls[0].slice(1);
      return { success: true, value: contractState.payments[paymentId] };
    });
    
    const result = mockContractCall('get-payment', 0);
    expect(result).toEqual({
      success: true,
      value: {
        product_id: 0,
        amount: 1000,
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        paid: false
      }
    });
  });
});

