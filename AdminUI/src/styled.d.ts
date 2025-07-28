import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      primary: string;
      primaryLight: string;
      accent: string;
    };
    spacing: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
