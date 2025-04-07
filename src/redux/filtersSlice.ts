import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubscriptionState {
    subscriptions: string[],
    satelliteId: string | null,
    tcaThreshold: number | null,
    pocThreshold: number | null,
}
const initialState: SubscriptionState = {
    subscriptions: [],
    satelliteId: null,
    tcaThreshold: null, // Unix timestamp
    pocThreshold: null // number
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {

        addSubscription: (state, action: PayloadAction<string>) => {
            state.subscriptions = [...state.subscriptions, action.payload]
        },
        setSubscriptions: (state, action) => {
            state.subscriptions = action.payload;
        },
        setSatelliteId: (state, action) => {
            state.satelliteId = action.payload;
        },
        setTcaThreshold: (state, action) => {
            state.tcaThreshold = action.payload;
        },
        setPocThreshold: (state, action) => {
            state.pocThreshold = action.payload;
        },
        clearFilters: (state) => {
            state.subscriptions = [];
            state.satelliteId = null;
            state.tcaThreshold = null;
            state.pocThreshold = null;
        }
    }
});

// Export selectors
export const { setPocThreshold, setSubscriptions, setTcaThreshold, setSatelliteId } = filtersSlice.actions
export default filtersSlice.reducer;