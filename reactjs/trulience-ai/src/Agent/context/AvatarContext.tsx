import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// Define types for the state
type AvatarState = {
    isMicEnabled: boolean;
    isSpeakerEnabled: boolean;
    loadingProgress: number;
    isCallStated: boolean;
    trulience: any
}

// Define action types
type Action =
    | { type: 'SET_MIC', payload: boolean }
    | { type: 'SET_SPEAKER', payload: boolean }
    | { type: 'SET_LOADING_PROGRESS'; payload: number }
    | { type: 'SET_TRULIENCE'; payload: any }
    | { type: 'SET_CALL_STARTED', payload: boolean }

// Initial state
const initialState: AvatarState = {
    isMicEnabled: false,
    isSpeakerEnabled: false,
    loadingProgress: 0,
    trulience: null,
    isCallStated: false
};

// Reducer function
const avatarReducer = (state: AvatarState, action: Action): AvatarState => {
    switch (action.type) {
        case 'SET_CALL_STARTED':
            return { ...state, isCallStated: action.payload };
        case 'SET_MIC':
            return { ...state, isMicEnabled: action.payload };
        case 'SET_SPEAKER':
            return { ...state, isSpeakerEnabled: action.payload };
        case 'SET_LOADING_PROGRESS':
            return { ...state, loadingProgress: action.payload }; 
        case 'SET_TRULIENCE':
            return { ...state, trulience: action.payload }; 
        default:
            return state;
    }
};

// Create Context
const AvatarContext = createContext<{
    state: AvatarState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Context Provider Component
export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(avatarReducer, initialState);

    return (
        <AvatarContext.Provider value={{ state, dispatch }}>
            {children}
        </AvatarContext.Provider>
    );
};

// Custom Hook for using AvatarContext
export const useAvatarContext = (): { state: AvatarState; dispatch: React.Dispatch<Action> } => {
    const context = useContext(AvatarContext);
    if (!context) {
        throw new Error('useAvatarContext must be used within an AvatarProvider');
    }
    return context;
};
