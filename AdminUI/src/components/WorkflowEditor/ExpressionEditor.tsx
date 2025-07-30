import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, type CompletionContext, completeFromList } from '@codemirror/autocomplete';

interface Props {
    value: string;
    onChange: (value: string) => void;
    completions?: string[];
}

export default function ExpressionEditor({ value, onChange, completions = [] }: Props) {
    const completion = autocompletion({
        override: [
            (ctx: CompletionContext) => {
                const word = ctx.matchBefore(/\w*/);
                if (!word || word.from == word.to && !ctx.explicit) return null;
                return {
                    from: word.from,
                    options: completions.map(c => ({ label: c, type: 'variable' })),
                };
            },
        ],
    });

    return (
        <CodeMirror
            value={value}
            height="auto"
            onChange={(val) => onChange(val)}
            extensions={[javascript(), EditorView.lineWrapping, completion]}
        />
    );
}
