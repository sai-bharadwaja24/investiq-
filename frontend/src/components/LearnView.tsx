import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Lesson } from '../types';
import { api } from '../services/api';

export const LearnView: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    api.getLessons().then((data) => {
      setLessons(data);
      if (data.length > 0) setSelectedLesson(data[0]);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">InvestIQ Beginner Knowledge Base</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Master stock market fundamentals, technical indicators, probabilities, and risk management in plain English.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson List */}
        <div className="space-y-3">
          {lessons.map((l) => {
            const isSelected = selectedLesson?.id === l.id;
            return (
              <div
                key={l.id}
                onClick={() => setSelectedLesson(l)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#182030] border-emerald-500/50 shadow-md'
                    : 'bg-[#121622] border-[#20283A] hover:bg-[#161C2C]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>{l.category}</span>
                  <span className="text-emerald-400">{l.reading_time}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{l.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{l.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Lesson Detail Reader */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <div className="bg-[#121622] border border-[#20283A] rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                  <span>{selectedLesson.category}</span>
                  <span>•</span>
                  <span>{selectedLesson.difficulty}</span>
                </div>
                <h2 className="text-2xl font-black text-white">{selectedLesson.title}</h2>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed space-y-4">
                <p>{selectedLesson.content}</p>
              </div>

              {/* Key Takeaway Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Beginner Rule of Thumb:</span>
                </div>
                <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                  {selectedLesson.key_takeaway}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-slate-400 bg-[#121622] rounded-2xl border border-[#20283A]">
              Select a lesson to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
