/// <reference types="@elsa-workflows/elsa-workflows-studio/dist/types/components" />

import React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'elsa-studio-root': any;
            'elsa-studio-dashboard': any;
            'elsa-workflow-definition-editor': any;
        }
    }
}
