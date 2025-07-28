import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      primary: string;
      primaryLight: string;
      accent: string;
      secondary: string;
      border: string;
    };
    spacing: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    radius: string;
    fontSizes: {
      sm: string;
      md: string;
      lg: string;
    };
    fonts: {
      body: string;
      heading: string;
    };
  }
}
