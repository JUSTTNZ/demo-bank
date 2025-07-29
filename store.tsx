import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
 interface Language {
  code: string;
  name: string;
  flag: string;
}
 interface LanguageState {
  currentLanguage: string;
  availableLanguages: Language[];
}

interface RootState {
  language: LanguageState;
}// Initial state
const initialState: RootState = {
  language: {
    currentLanguage: 'en',
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
    ]
  }
};

// Define action types
type Action =
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "RESET_LANGUAGE" };

// Root reducer
const reducer = (state: RootState = initialState, action: Action): RootState => {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { 
        ...state, 
        language: {
          ...state.language,
          currentLanguage: action.payload
        }
      };
    
    case "RESET_LANGUAGE":
      return {
        ...state,
        language: {
          ...state.language,
          currentLanguage: 'en'
        }
      };
    
    default:
      return state;
  }
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['language'],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Export types for useSelector and useDispatch
export type AppDispatch = typeof store.dispatch;