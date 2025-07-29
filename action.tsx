import { Dispatch } from 'redux';

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
}
/**
 * Action to set the current language
 */
export const setLanguage = (languageCode: string) => ({
  type: "SET_LANGUAGE" as const,
  payload: languageCode
});

/**
 * Action to reset language to default
 */
export const resetLanguage = () => ({
  type: "RESET_LANGUAGE" as const
});

/**
 * Validates and changes language
 */
export const changeLanguage = (languageCode: string) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const { language } = getState();
    const isValidLanguage = language.availableLanguages.some(
      (lang) => lang.code === languageCode
    );
    
    if (isValidLanguage) {
      dispatch(setLanguage(languageCode));
    } else {
      console.warn(`Invalid language code: ${languageCode}`);
    }
  };
};

// Export action types for type safety
export type LanguageActions = 
  | ReturnType<typeof setLanguage>
  | ReturnType<typeof resetLanguage>;