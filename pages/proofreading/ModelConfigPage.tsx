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

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Key, Check, ChevronDown, Zap } from 'lucide-react';
import { AiConfig } from '../../types';
import { Button } from '@/components/ui/button';
import { MODEL_FAMILIES } from '../../modelConfig';
import { DEV_KEYS } from '../../devConfig';

// Badge sizing constants for easy adjustment
const FAMILY_BADGE_SIZE = 'text-[9px]';
const OPTION_BADGE_SIZE = 'text-[7px]';

interface ModelConfigPageProps {
  onBack: () => void;
  onConfirm: (config: AiConfig) => void;
}

export const ModelConfigPage: React.FC<ModelConfigPageProps> = ({ onBack, onConfirm }) => {
  // --- Local UI State ---
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(MODEL_FAMILIES[0].id);
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [rememberOpenRouter, setRememberOpenRouter] = useState(false);
  const [nitro, setNitro] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
   * Handle click outside to close custom dropdowns
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    let modelId = family.getModelId(familySelections);
    
    // Append nitro flag if enabled for OpenRouter providers
    if (family.provider === 'openrouter' && nitro) {
      modelId = `${modelId}:nitro`;
    }

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
    setActiveDropdown(null);
  };

  const badgeStyles: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-8 rounded-2xl shadow-sm border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-primary/10 text-primary rounded-xl mb-4"><Cpu size={28} /></div>
        <h2 className="text-2xl font-bold text-foreground">Configure AI Proofreader</h2>
        <p className="text-muted-foreground mt-2">Select the intelligence model that best fits your needs.</p>
      </div>

      {/* Conditional OpenRouter Key Entry & Nitro Mode */}
      {isKeyRequired && (
        <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Key size={14} className="text-primary"/> OpenRouter API Key
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-..." 
                autoFocus
                className="w-full pl-4 pr-4 py-3 border border-primary/30 rounded-xl focus:ring-2 focus:ring-ring outline-none bg-primary/5 text-foreground"
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
              <label htmlFor="remember_openrouter" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember this key for next time
              </label>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4 transition-all">
            <input 
              type="checkbox" 
              id="nitro_mode"
              checked={nitro}
              onChange={(e) => setNitro(e.target.checked)}
              className="mt-1.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
            />
            <div className="flex-1">
              <label htmlFor="nitro_mode" className="text-sm font-bold text-indigo-900 cursor-pointer flex items-center gap-1.5">
                <Zap size={14} className="fill-current text-amber-500" /> Nitro Mode
              </label>
              <p className="text-xs text-indigo-600/70 mt-1 leading-relaxed">
                Prioritizes the fastest available providers on OpenRouter. May incur higher token costs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model Family List */}
      <div className="space-y-4" ref={dropdownRef}>
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
                        <span className={`px-1.5 py-[0.5px] rounded-full ${FAMILY_BADGE_SIZE} uppercase font-bold tracking-wider border ${badgeStyles[family.badge.color] || badgeStyles.blue}`}>
                          {family.badge.label}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>
                      {family.description}
                    </p>
                  </div>
                </div>

                {/* Sub-options (Custom Dropdowns) */}
                {family.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center md:justify-end mt-2 md:mt-0">
                    {family.options.map((opt) => {
                      const dropdownId = `${family.id}-${opt.id}`;
                      const isOpen = activeDropdown === dropdownId;
                      const currentVal = selections[family.id][opt.id];
                      const currentChoice = opt.choices.find(c => c.value === currentVal);

                      return (
                        <div key={opt.id} className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveDropdown(isOpen ? null : dropdownId)}
                            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium border outline-none transition-all ${
                               isSelected ? 'bg-white border-blue-200 text-blue-800 shadow-sm' : 'bg-slate-100 border-transparent text-slate-600 group-hover:bg-white group-hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate max-w-[150px] md:max-w-[200px]">{currentChoice?.label}</span>
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} 
                            />
                          </button>
                          
                          {/* Custom Options List */}
                          {isOpen && (
                            <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[220px] max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                              {opt.choices.map((choice) => (
                                <button
                                  key={choice.value}
                                  onClick={() => handleOptionChange(family.id, opt.id, choice.value)}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    currentVal === choice.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="flex-1 text-left">{choice.label}</span>
                                  {choice.badge && (
                                    <span className={`ml-2 px-1 py-0 rounded-full ${OPTION_BADGE_SIZE} uppercase font-bold tracking-tight border shrink-0 ${badgeStyles[choice.badge.color] || badgeStyles.blue}`}>
                                      {choice.badge.label}
                                    </span>
                                  )}
                                  {currentVal === choice.value && <Check size={14} className="ml-2 shrink-0" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
