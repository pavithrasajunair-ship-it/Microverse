import React, { useState } from 'react';
import { Assembly8085Playground } from './Assembly8085Playground';
import { Architecture8085Explorer } from '../visuals/Architecture8085Explorer';
import { Pinout8085Explorer } from '../visuals/Pinout8085Explorer';
import { InstructionVisualizer } from '../visuals/InstructionVisualizer';
import { ConceptVisualEngine, Ppi8255Visual, TimingDiagramInteractive } from '../visuals/ConceptVisualEngine';
import { MemoryStackLab } from './MemoryStackLab';
import {
  Dma8237Experiment,
  KeypadMatrixExperiment,
  Pic8259Experiment,
  Timer8253Experiment,
} from './VirtualExperiments';
import {
  FlagAluSimulator,
  HardwareInterfacingLab,
  NumberSystemLab,
  StackAndAddressingLab,
} from './ElectronicsSimulators';

export type LabTabId =
  | 'emulator'
  | 'animator'
  | 'architecture'
  | 'pinout'
  | 'memory'
  | 'flags'
  | 'timing'
  | 'peripherals'
  | 'interfacing'
  | 'converter'
  | 'stack'
  | 'addressing';

const LAB_TABS: Array<{ id: LabTabId; label: string }> = [
  { id: 'emulator', label: '4-Pane 8085 Execution Lab' },
  { id: 'animator', label: 'Instruction Animator (12 Ops)' },
  { id: 'architecture', label: '8085 Architecture' },
  { id: 'pinout', label: '40-Pin DIP' },
  { id: 'memory', label: 'Memory, Stack & Endian' },
  { id: 'flags', label: 'ALU, Logic & Flags' },
  { id: 'timing', label: 'Timing Diagrams' },
  { id: 'peripherals', label: '8255 / 8254 / 8259 / DMA / Keypad' },
  { id: 'interfacing', label: 'LED / 7-Seg / 8051 / Interrupts' },
  { id: 'converter', label: 'Binary / Hex & Addressing' },
];

export const VirtualLab: React.FC<{ initialTab?: LabTabId; initialCode?: string }> = ({
  initialTab = 'emulator',
  initialCode,
}) => {
  // Normalize alias tabs ('stack' -> 'memory', 'addressing' -> 'animator')
  const normalizedInitial: LabTabId =
    initialTab === 'stack' ? 'memory' : initialTab === 'addressing' ? 'animator' : initialTab;
  const [activeTab, setActiveTab] = useState<LabTabId>(normalizedInitial);
  const [periphSub, setPeriphSub] = useState<'8255' | '8254' | '8259' | '8237' | 'keypad'>('8255');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Virtual Electronics &amp; Microprocessor Lab
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Step through live 8085 instruction datapaths, execute real assembly programs, inspect timing waveforms, and test 8255/8254/8259/8237/8051 hardware experiments.
        </p>
      </div>

      {/* Interactive Lab Switcher */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1729] border border-slate-200 dark:border-slate-800">
        {LAB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'emulator' && <Assembly8085Playground initialCode={initialCode} />}

        {activeTab === 'animator' && (
          <div className="space-y-6">
            <InstructionVisualizer defaultInstruction="MOV" />
          </div>
        )}

        {activeTab === 'architecture' && <Architecture8085Explorer />}

        {activeTab === 'pinout' && <Pinout8085Explorer />}

        {activeTab === 'memory' && (
          <div className="space-y-6">
            <MemoryStackLab />
            <ConceptVisualEngine visualType="8085-memory-map" />
          </div>
        )}

        {activeTab === 'flags' && <FlagAluSimulator />}

        {activeTab === 'timing' && <TimingDiagramInteractive />}

        {activeTab === 'peripherals' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: '8255' as const, label: '8255A PPI Control Word' },
                { id: '8254' as const, label: '8253 / 8254 Interval Timer' },
                { id: '8259' as const, label: '8259A Interrupt Controller' },
                { id: '8237' as const, label: '8237 DMA Bus Arbitration' },
                { id: 'keypad' as const, label: '4×4 Matrix Keypad Scanner' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setPeriphSub(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                    periphSub === sub.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white dark:bg-[#0E1729] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
            {periphSub === '8255' && <Ppi8255Visual />}
            {periphSub === '8254' && <Timer8253Experiment />}
            {periphSub === '8259' && <Pic8259Experiment />}
            {periphSub === '8237' && <Dma8237Experiment />}
            {periphSub === 'keypad' && <KeypadMatrixExperiment />}
          </div>
        )}

        {activeTab === 'interfacing' && (
          <div className="space-y-6">
            <HardwareInterfacingLab />
            <ConceptVisualEngine visualType="8051-ports-timers" />
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="space-y-6">
            <NumberSystemLab />
            <StackAndAddressingLab />
          </div>
        )}
      </div>
    </div>
  );
};
