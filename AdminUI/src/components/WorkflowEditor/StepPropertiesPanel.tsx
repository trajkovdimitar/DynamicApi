import React from 'react';
import { Controlled as CodeMirror } from '@uiw/react-codemirror';
import { autocompletion, CompletionContext, Completion } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { stepTypes } from '../../types/models';
import type { WorkflowDefinition, WorkflowStep } from '../../types/models';
import StepParameterEditor from './StepParameterEditor';
import Input from '../common/Input';

interface Props {
  workflow: WorkflowDefinition;
  step: WorkflowStep;
  index: number;
  onChange: (step: WorkflowStep) => void;
}

export default function StepPropertiesPanel({ workflow, step, onChange }: Props) {
  const update = (partial: Partial<WorkflowStep>) => onChange({ ...step, ...partial });

  const variables = [
    ...workflow.globalVariables.map((v) => `Vars.${v.key}`),
    ...workflow.steps
      .map((s) => (s.outputVariable ? `Workflow.${s.outputVariable}` : null))
      .filter(Boolean) as string[],
    'Input.'
  ];

  const complete = (context: CompletionContext) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    const options: Completion[] = variables.map((v) => ({ label: v, type: 'variable' }));
    return {
      from: word.from,
      options,
    };
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Step Details</h3>

      <select
        className="border rounded p-2 w-full dark:bg-neutral-800"
        value={step.type}
        onChange={(e) => update({ type: e.target.value })}
      >
        {stepTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <CodeMirror
        height="40px"
        value={step.condition ?? ''}
        onChange={(val) => update({ condition: val })}
        extensions={[
          autocompletion({ override: [complete] }),
          EditorView.lineWrapping,
        ]}
        basicSetup={{ lineNumbers: false }}
        placeholder="Condition (C# expression)"
      />

      <Input
        placeholder="OnError (e.g. Retry:3)"
        value={step.onError ?? ''}
        onChange={(e) => update({ onError: e.target.value })}
      />

      <Input
        placeholder="Output Variable"
        value={step.outputVariable ?? ''}
        onChange={(e) => update({ outputVariable: e.target.value })}
      />

      <StepParameterEditor step={step} onChange={onChange} />
    </div>
  );
}
