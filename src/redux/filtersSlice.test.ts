import filtersReducer, { 
  setSubscriptions, 
  setSatelliteId,
  setTcaThreshold,
  setPocThreshold
} from './filtersSlice';
import { PayloadAction } from '@reduxjs/toolkit';

// Import the state type from the slice file
interface SubscriptionState {
  subscriptions: string[],
  satelliteId: string | null,
  tcaThreshold: number | null,
  pocThreshold: number | null,
}

describe('filtersSlice reducer', () => {
  const initialState: SubscriptionState = {
    subscriptions: [],
    satelliteId: null,
    tcaThreshold: null,
    pocThreshold: null
  };

  test('should return the initial state', () => {
    // Use a properly typed empty action
    const emptyAction = { type: '' } as PayloadAction<undefined>;
    expect(filtersReducer(undefined, emptyAction)).toEqual(initialState);
  });

  test('should handle setSubscriptions', () => {
    const subscriptions = ['subscription1', 'subscription2'];
    const nextState = filtersReducer(initialState, setSubscriptions(subscriptions));
    
    expect(nextState.subscriptions).toEqual(subscriptions);
  });

  test('should handle setSatelliteId', () => {
    const satelliteId = 'satellite123';
    const nextState = filtersReducer(initialState, setSatelliteId(satelliteId));
    
    expect(nextState.satelliteId).toEqual(satelliteId);
  });

  test('should handle setTcaThreshold', () => {
    const threshold = 1644064000000; // Example timestamp
    const nextState = filtersReducer(initialState, setTcaThreshold(threshold));
    
    expect(nextState.tcaThreshold).toEqual(threshold);
  });

  test('should handle setPocThreshold', () => {
    const threshold = 0.05;
    const nextState = filtersReducer(initialState, setPocThreshold(threshold));
    
    expect(nextState.pocThreshold).toEqual(threshold);
  });

  test('should handle multiple actions in sequence', () => {
    let state: SubscriptionState = initialState;
    
    state = filtersReducer(state, setSubscriptions(['sub1']));
    state = filtersReducer(state, setSatelliteId('sat1'));
    state = filtersReducer(state, setTcaThreshold(1000));
    state = filtersReducer(state, setPocThreshold(0.1));
    
    expect(state).toEqual({
      subscriptions: ['sub1'],
      satelliteId: 'sat1',
      tcaThreshold: 1000,
      pocThreshold: 0.1
    });
  });
}); 