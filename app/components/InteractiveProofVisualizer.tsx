"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Sparkles,
  Zap,
  HelpCircle,
  RotateCcw,
  Sliders,
  Server,
  Workflow,
} from "lucide-react";
import type { DemonstrationConfig, DemonstrationType } from "@/app/lib/types";

interface Props {
  type: DemonstrationType;
  config?: DemonstrationConfig;
  title?: string;
}

export default function InteractiveProofVisualizer({ type, config, title }: Props) {
  // State for Architecture Visualizer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    config?.nodes?.[0]?.id || null
  );

  // State for Before / After
  const [viewMode, setViewMode] = useState<"after" | "before">("after");

  // State for Decision Simulation
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<Record<number, number>>({});

  // State for System Flow
  const [flowStep, setFlowStep] = useState(0);

  const nodes = config?.nodes || [];
  const connections = config?.connections || [];
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const beforeMetrics = config?.beforeMetrics || [];
  const afterMetrics = config?.afterMetrics || [];

  const decisionSteps = config?.decisionSteps || [];
  const currentDecision = decisionSteps[activeStepIndex];

  const flowSteps = config?.flowSteps || [];

  return (
    <div className="paper-card p-6 sm:p-8 bg-[var(--surface-soft)] border-2 border-[var(--foreground)] rounded-2xl shadow-[6px_6px_0_0_rgba(42,36,31,0.15)] overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--foreground)]/15">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--foreground)] text-[var(--surface)] shadow-[2px_2px_0_0_rgba(42,36,31,0.2)]">
            {type === "architecture_visualizer" && <Cpu className="h-5 w-5" />}
            {type === "before_after" && <Sliders className="h-5 w-5" />}
            {type === "decision_simulation" && <HelpCircle className="h-5 w-5" />}
            {type === "system_flow" && <Workflow className="h-5 w-5" />}
            {type === "interactive_demo" && <Sparkles className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--accent)]">
              Interactive Evidence Demo
            </div>
            <h4 className="text-lg font-black text-[var(--foreground)] tracking-tight">
              {title || "Live Demonstration"}
            </h4>
          </div>
        </div>
        <span className="paper-chip text-[10px] font-mono tracking-wider uppercase bg-[var(--surface)]">
          {type.replace("_", " ")}
        </span>
      </div>

      {/* 1. Architecture Visualizer */}
      {type === "architecture_visualizer" && (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-[var(--foreground)]/70">
            Click on any architectural node to inspect its component role and state.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <motion.button
                  key={node.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-[var(--foreground)] bg-[var(--surface)] shadow-[4px_4px_0_0_rgba(42,36,31,0.2)] ring-2 ring-[var(--accent)]"
                      : "border-[var(--foreground)]/20 bg-[var(--surface)] hover:border-[var(--foreground)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      #{node.id}
                    </span>
                    {node.status && (
                      <span className="paper-chip text-[10px] uppercase font-mono px-2 py-0.5 bg-[var(--surface-strong)]">
                        {node.status}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-[var(--foreground)]">{node.label}</div>
                </motion.button>
              );
            })}
          </div>

          {connections.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--foreground)]/15">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2">
                System Connections
              </div>
              <div className="flex flex-wrap gap-2">
                {connections.map((conn, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--foreground)]/20 text-xs font-mono bg-[var(--surface-soft)]"
                  >
                    <span className="font-bold">{conn.from}</span>
                    <ArrowRight className="h-3 w-3 text-[var(--accent)]" />
                    <span className="font-bold">{conn.to}</span>
                    {conn.label && (
                      <span className="text-[10px] text-[var(--foreground)]/60">({conn.label})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedNode && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-xl bg-[var(--surface)] border-2 border-[var(--foreground)]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-4 w-4 text-[var(--accent)]" />
                  <h5 className="font-black text-sm text-[var(--foreground)]">
                    {selectedNode.label} Inspector
                  </h5>
                </div>
                <p className="text-sm text-[var(--foreground)]/80">
                  {selectedNode.description || "Node configured and active in system pipeline."}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* 2. Before / After Comparison */}
      {type === "before_after" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex rounded-full border-2 border-[var(--foreground)] p-1 bg-[var(--surface)] shadow-[2px_2px_0_0_rgba(42,36,31,0.15)]">
              <button
                onClick={() => setViewMode("before")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === "before"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                {config?.beforeLabel || "Before Optimization"}
              </button>
              <button
                onClick={() => setViewMode("after")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === "after"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
                }`}
              >
                {config?.afterLabel || "After Implementation"}
              </button>
            </div>
            <span className="text-xs font-medium text-[var(--foreground)]/60 hidden sm:inline">
              Toggle view to compare metrics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(viewMode === "before" ? beforeMetrics : afterMetrics).map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`p-5 rounded-xl border-2 bg-[var(--surface)] shadow-[4px_4px_0_0_rgba(42,36,31,0.1)] ${
                  viewMode === "after" ? "border-[var(--accent)]" : "border-[var(--foreground)]/30"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-1">
                  {metric.label}
                </div>
                <div className="text-3xl font-black text-[var(--foreground)] tracking-tight">
                  {metric.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Decision Simulation */}
      {type === "decision_simulation" && decisionSteps.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]/60">
            <span>
              Scenario {activeStepIndex + 1} of {decisionSteps.length}
            </span>
            <button
              onClick={() => {
                setActiveStepIndex(0);
                setUserChoices({});
              }}
              className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart Simulation
            </button>
          </div>

          {currentDecision && (
            <div className="space-y-4">
              <h5 className="text-base font-black text-[var(--foreground)]">
                {currentDecision.question}
              </h5>

              <div className="grid grid-cols-1 gap-3">
                {currentDecision.options.map((opt, optIdx) => {
                  const isSelected = userChoices[activeStepIndex] === optIdx;
                  return (
                    <motion.button
                      key={optIdx}
                      whileHover={{ x: 2 }}
                      whileTap={{ x: 0 }}
                      onClick={() =>
                        setUserChoices((prev) => ({ ...prev, [activeStepIndex]: optIdx }))
                      }
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? opt.recommended
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                            : "border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)]"
                          : "border-[var(--foreground)]/20 bg-[var(--surface)] hover:border-[var(--foreground)]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{opt.label}</span>
                        {opt.recommended && (
                          <span className="paper-chip text-[10px] uppercase font-mono bg-emerald-200 text-emerald-900 border-emerald-400">
                            Recommended Strategy
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 text-xs font-medium border-t border-[var(--foreground)]/10 pt-2 opacity-90"
                        >
                          <strong>Outcome:</strong> {opt.outcome}
                        </motion.p>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {activeStepIndex < decisionSteps.length - 1 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveStepIndex((prev) => prev + 1)}
                    className="paper-button px-5 py-2 text-xs font-bold inline-flex items-center gap-2"
                  >
                    <span>Next Scenario</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. System Flow */}
      {type === "system_flow" && flowSteps.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[var(--foreground)]/70">
              Step-by-step workflow execution stream.
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={flowStep === 0}
                onClick={() => setFlowStep((s) => Math.max(0, s - 1))}
                className="paper-button px-3 py-1 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={flowStep === flowSteps.length - 1}
                onClick={() => setFlowStep((s) => Math.min(flowSteps.length - 1, s + 1))}
                className="paper-button-primary px-3 py-1 text-xs disabled:opacity-40"
              >
                Next Step
              </button>
            </div>
          </div>

          <div className="relative border-l-2 border-[var(--foreground)]/30 ml-4 pl-6 space-y-6">
            {flowSteps.map((step, idx) => {
              const isActive = idx === flowStep;
              const isPassed = idx < flowStep;
              return (
                <motion.div
                  key={idx}
                  onClick={() => setFlowStep(idx)}
                  className={`cursor-pointer transition-all ${
                    isActive ? "opacity-100 scale-100" : "opacity-60 scale-95"
                  }`}
                >
                  <div
                    className={`absolute -left-[17px] mt-1 h-8 w-8 rounded-full border-2 border-[var(--foreground)] flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-white scale-110"
                        : isPassed
                        ? "bg-[var(--foreground)] text-[var(--surface)]"
                        : "bg-[var(--surface)] text-[var(--foreground)]"
                    }`}
                  >
                    {step.step || idx + 1}
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[var(--foreground)]/20 bg-[var(--surface)]">
                    <h6 className="font-black text-sm text-[var(--foreground)]">{step.title}</h6>
                    <p className="mt-1 text-xs text-[var(--foreground)]/80">{step.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Generic Interactive Demo fallback */}
      {type === "interactive_demo" && (
        <div className="p-6 rounded-xl border-2 border-[var(--foreground)] bg-[var(--surface)] text-center space-y-4">
          <Zap className="h-10 w-10 text-[var(--accent)] mx-auto" />
          <h5 className="font-black text-lg text-[var(--foreground)]">
            Live Technical Demonstration
          </h5>
          <p className="max-w-md mx-auto text-xs text-[var(--foreground)]/70 leading-relaxed">
            This capability features an interactive technical demonstration configured in real time.
          </p>
        </div>
      )}
    </div>
  );
}
