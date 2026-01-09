
/**
 * pages/proofreading/ModelConfigPage.tsx
 * 
 * A detailed configuration page for selecting and tuning the AI model used for proofreading.
 * Responsibilities include:
 * - Displaying supported AI provider families (Gemini, OpenRouter).
 * - Collecting API keys for third-party providers.
 * - Managing complex model selection logic based on multiple parameters (size, version, etc).
 * - Persisting selected keys locally for future convenience.
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Key, Check, ChevronDown } from 'lucide-react';
import { AiConfig } from '../../types';
import { Button } from '../../components/Button';
import { MODEL_FAMILIES } from '../../modelConfig';
import { DEV_KEYS } from '../../devConfig';

interface ModelConfigPageProps {
  onBack: () => void;
  onConfirm: (config: AiConfig) => void;
}

export const ModelConfigPage: React.FC<ModelConfigPageProps> = ({ onBack, onConfirm }) => {
  // --- Local UI State ---
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(MODEL_FAMILIES[0].id);
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [rememberOpenRouter, setRememberOpenRouter] = useState(false);

  /**
   * Initialize OpenRouter key from localStorage or devConfig if saved.
   */
  useEffect(() => {
    const savedKey = localStorage.getItem('img2docx_openrouter_key') || DEV_KEYS.OPENROUTER;
    if (savedKey) {
      setOpenRouterKey(savedKey);
      setRememberOpenRouter(true);
    }
  }, []);

  /**
   * Maintain selections for every possible model option across all families.
   * Structured as: { [familyId]: { [optionId]: selectedValue } }
   */
  const [selections, setSelections] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    MODEL_FAMILIES.forEach(family => {
      initial[family.id] = {};
      family.options.forEach(opt => {
        initial[family.id][opt.id] = opt.default;
      });
    });
    return initial;
  });

  const currentFamily = MODEL_FAMILIES.find(f => f.id === selectedFamilyId)!;
  const isKeyRequired = currentFamily.provider === 'openrouter';

  /**
   * Validates the configuration and triggers the confirmation callback.
   */
  const handleStart = () => {
    const family = MODEL_FAMILIES.find(f => f.id === selectedFamilyId);
    if (!family) return;
    
    // Manage persistence of OpenRouter keys
    if (family.provider === 'openrouter') {
      if (rememberOpenRouter) {
        localStorage.setItem('img2docx_openrouter_key', openRouterKey);
      } else {
        localStorage.removeItem('img2docx_openrouter_key');
      }
    }

    const familySelections = selections[family.id];
    const modelId = family.getModelId(familySelections);
    
    onConfirm({ 
      provider: family.provider, 
      modelId,
      apiKey: family.provider === 'openrouter' ? openRouterKey : undefined
    });
  };

  /**
   * Updates a specific model option and switches to that family.
   */
  const handleOptionChange = (familyId: string, optionId: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [familyId]: {
        ...prev[familyId],
        [optionId]: value
      }
    }));
    setSelectedFamilyId(familyId);
  };

  const badgeStyles: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-100 text-indigo-600 rounded-xl mb-4"><Cpu size={28} /></div>
        <h2 className="text-2xl font-bold text-slate-900">Configure AI Proofreader</h2>
        <p className="text-slate-500 mt-2">Select the intelligence model that best fits your needs.</p>
      </div>

      {/* Conditional OpenRouter Key Entry */}
      {isKeyRequired && (
        <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Key size={14} className="text-indigo-500"/> OpenRouter API Key
          </label>
          <div className="relative">
            <input 
              type="password" 
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-..." 
              autoFocus
              className="w-full pl-4 pr-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30 text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="remember_openrouter"
              checked={rememberOpenRouter}
              onChange={(e) => setRememberOpenRouter(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember_openrouter" className="text-xs text-slate-500 cursor-pointer select-none">
              Remember this key for next time
            </label>
          </div>
        </div>
      )}

      {/* Model Family List */}
      <div className="space-y-4">
        {MODEL_FAMILIES.map((family) => {
          const isSelected = selectedFamilyId === family.id;
          return (
            <div 
              key={family.id}
              onClick={() => setSelectedFamilyId(family.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-100' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Selection indicator */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-base ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {family.name}
                      </h3>
                      {family.badge && (
                        <span className={`px-2 py-[1px] rounded-full text-[10px] uppercase font-bold tracking-wider border ${badgeStyles[family.badge.color] || badgeStyles.blue}`}>
                          {family.badge.label}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>
                      {family.description}
                    </p>
                  </div>
                </div>

                {/* Sub-options (like Model Variant or Parameter Size) */}
                {family.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center md:justify-end mt-2 md:mt-0">
                    {family.options.map((opt) => (
                      <div key={opt.id} className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={selections[family.id][opt.id]}
                          onChange={(e) => handleOptionChange(family.id, opt.id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                             isSelected ? 'bg-white border-blue-200 text-blue-800 shadow-sm' : 'bg-slate-100 border-transparent text-slate-600 group-hover:bg-white group-hover:border-slate-300'
                          }`}
                        >
                          {opt.choices.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={14} 
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex gap-3 pt-8 mt-6 border-t border-slate-100">
        <Button variant="ghost" onClick={onBack} className="flex-1">Back</Button>
        <Button 
          onClick={handleStart} 
          disabled={isKeyRequired && !openRouterKey} 
          className="flex-1"
        >
          Start Review
        </Button>
      </div>
    </div>
  );
};
