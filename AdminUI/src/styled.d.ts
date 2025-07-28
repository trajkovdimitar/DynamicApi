import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      primary: string;
      primaryLight: string;
      primaryDark: string;
      border: string;
      secondary: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
    fontSizes: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
