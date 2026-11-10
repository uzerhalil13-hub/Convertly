import { AppState, AppAction } from '../types';

export const initialState: AppState = {
  file: null,
  mediaType: null,
  inputFormat: null,
  outputFormat: null,
  isDropdownOpen: false,
  isConverting: false,
  result: null,
  error: null,
  isMuted: false, 
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return {
        ...state,
        file: action.payload.file,
        mediaType: action.payload.mediaType,
        inputFormat: action.payload.inputFormat,
        outputFormat: null,
        result: null,
        error: null,
        isDropdownOpen: false,
        isMuted: false, 
      };
    case 'CLEAR_FILE':
      return initialState;
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.payload, isDropdownOpen: false };
    case 'OPEN_DROPDOWN':
      return { ...state, isDropdownOpen: true };
    case 'CLOSE_DROPDOWN':
      return { ...state, isDropdownOpen: false };
    case 'START_CONVERSION':
      return { ...state, isConverting: true, error: null, result: null };
    case 'CONVERSION_SUCCESS':
      return { ...state, isConverting: false, result: action.payload };
    case 'CONVERSION_ERROR':
      return { ...state, isConverting: false, error: action.payload };
    case 'CONVERSION_CANCELLED':
      return { ...state, isConverting: false, result: null, error: null };
    case 'RESET_RESULT':
      return { ...state, result: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'TOGGLE_MUTE': 
      return { ...state, isMuted: !state.isMuted };
    default:
      return state;
  }
}