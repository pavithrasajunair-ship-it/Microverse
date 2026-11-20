import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { LEARNING_MODULES } from '../../data/modules';
import { MODULE_NOTES } from '../../data/notes';
import { ModuleId } from '../../types';

export const NotesCenterView: React.FC = () => {
  const [moduleId, setModuleId] = useState<ModuleId>('8085');
  const note = MODULE_NOTES[moduleId];

  const downloadNotes = () => {
    const lines = [
      `# ${note.title}`,
      '',
      '## Concise Summary',
      ...note.conciseSummary.map((s) => `- ${s}`),
      '',
      '## Detailed Conceptual Notes',
      ...note.detailedSections.flatMap((s) => [`### ${s.heading}`, s.body, '']),
      '## Key Formulas & Reference Tables',
      ...note.formulaAndTables.map((f) => `- **${f.label}**: \`${f.expression}\` (${f.note})`),
      '',
      '## 2-Mark Questions',
      ...note.examQA.twoMark.map((item) => `- **Q:** ${item.q}\n  **A:** ${item.a}`),
      '',
      '## 5-Mark Questions',
      ...note.examQA.fiveMark.map((item) => `- **Q:** ${item.q}\n  **A:** ${item.a}`),
      '',
      '## Last-Minute Revision Sheet',
      ...note.lastMinuteSheet.map((s) => `- ${s}`),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MicroVerse_${moduleId}_Revision_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notes &amp; Revision Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Structured engineering revision sheets, formulas, and 2-mark / 5-mark / 10-mark university exam answers.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadNotes}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Download Revision Sheet (.md)
        </button>
      </div>

      {/* Module Selector */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1729] border border-slate-200 dark:border-slate-800">
        {LEARNING_MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModuleId(m.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              moduleId === m.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {m.number} · {m.shortTitle}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* Concise Notes */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{note.title}</h2>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              {note.conciseSummary.map((line, i) => (
                <li key={i} className="leading-relaxed">{line}</li>
              ))}
            </ul>
          </section>

          {/* Detailed Sections */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Detailed Conceptual Notes</h3>
            {note.detailedSections.map((sec, i) => (
              <div key={i} className="space-y-1.5">
                <h4 className="text-sm font-semibold text-blue-600 dark:text-cyan-400">{sec.heading}</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </section>

          {/* 2, 5, 10 Mark Questions */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-6 space-y-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">University Exam Question Bank (2M / 5M / 10M)</h3>

            <div className="space-y-2.5">
              <div className="text-xs font-mono font-semibold text-blue-600 dark:text-cyan-400">2-MARK SHORT ANSWERS</div>
              {note.examQA.twoMark.map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 text-sm space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">{item.q}</div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400">5-MARK DESCRIPTIVE ANSWERS</div>
              {note.examQA.fiveMark.map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 text-sm space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">{item.q}</div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">10-MARK LONG ESSAY BLUEPRINT</div>
              {note.examQA.tenMark.map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</div>
                  <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {item.outline.map((pt, j) => <li key={j}>{pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Formulas + Last-Minute Sheet */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-3.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Formulas &amp; Spec Tables</h3>
            {note.formulaAndTables.map((f, i) => (
              <div key={i} className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">{f.label}</div>
                <div className="font-mono text-sm font-bold text-cyan-300">{f.expression}</div>
                <div className="text-[11px] text-slate-400">{f.note}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-cyan-300">
              <FileText className="w-4 h-4" />
              Last-Minute Exam Cheat Sheet
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {note.lastMinuteSheet.map((tip, i) => (
                <li key={i} className="font-mono">• {tip}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
