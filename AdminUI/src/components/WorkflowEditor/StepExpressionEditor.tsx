import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

interface Props {
    value: string;
    onChange: (value: string) => void;
    suggestions?: string[];
}

export default function StepExpressionEditor({ value, onChange, suggestions = [] }: Props) {
    const extension = useMemo(() =>
        autocompletion({
            override: [
                (context: CompletionContext) => {
                    const word = context.matchBefore(/\w*/);
                    if (!word || (word.from === word.to && !context.explicit)) return null;
                    return {
                        from: word.from,
                        options: suggestions.map(s => ({ label: s, type: 'variable' }))
                    };
                }
            ]
        }), [suggestions]);

    return (
        <CodeMirror
            value={value}
            height="auto"
            extensions={[javascript({ jsx: false }), extension]}
            onChange={(val) => onChange(val)}
            basicSetup={{ lineNumbers: false }}
        />
    );
}
