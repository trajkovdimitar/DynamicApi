import { useEffect } from 'react';
import { defineCustomElements } from '@elsa-workflows/elsa-workflows-studio/loader';

export default function ElsaDashboard() {
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    return (
        <elsa-studio-root server-url="/elsa/api" monaco-lib-path="/elsa/monaco-editor/min">
            <elsa-studio-dashboard></elsa-studio-dashboard>
        </elsa-studio-root>
    );
}
