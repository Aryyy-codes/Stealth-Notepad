"use client";

import React from "react";
import { TECHNICAL_COMMUNICATION_SYLLABUS } from "@/lib/mockSyllabus";
import { BookMarked, CheckCircle2, ChevronRight, FileText } from "lucide-react";

interface SyllabusViewerProps {
  searchQuery: string;
}

export const SyllabusViewer: React.FC<SyllabusViewerProps> = ({ searchQuery }) => {
  const query = searchQuery.toLowerCase().trim();

  const filteredUnits = TECHNICAL_COMMUNICATION_SYLLABUS.filter((unit) => {
    if (!query) return true;
    const inTitle = unit.title.toLowerCase().includes(query);
    const inSummary = unit.summary.toLowerCase().includes(query);
    const inTopics = unit.topics.some(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.keyPoints.some((p) => p.toLowerCase().includes(query))
    );
    return inTitle || inSummary || inTopics;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 text-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-750">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-mono mb-2 uppercase tracking-wider">
          <BookMarked className="w-4 h-4 text-emerald-400" />
          <span>Curriculum Specification & Lecture Notes</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
          Technical Communication & Professional Writing
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Course module notes covering systemic communication models, semantic barriers, formal documentation architecture, and industry correspondence protocols.
        </p>

        {query && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs">
            <span>Filter Active: &quot;{searchQuery}&quot;</span>
            <span className="text-slate-400">({filteredUnits.length} modules found)</span>
          </div>
        )}
      </div>

      {/* Units List */}
      <div className="grid gap-4 sm:gap-6">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No matching syllabus units found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try querying &quot;memos&quot;, &quot;barriers&quot;, or &quot;7 Cs&quot;.</p>
          </div>
        ) : (
          filteredUnits.map((unit) => (
            <section
              key={unit.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  UNIT {unit.unitNumber}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {unit.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {unit.summary}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {unit.topics.map((topic, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {topic.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                      {topic.description}
                    </p>
                    <ul className="space-y-1">
                      {topic.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
