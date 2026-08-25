import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export function Tabs({ tabs, activeTab, onTabChange, className, variant = 'underline' }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-0',
        variant === 'underline' && 'border-b border-neutral-200',
        variant === 'pills' && 'bg-neutral-100 p-1 rounded-lg gap-1',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 text-body-sm font-medium transition-colors whitespace-nowrap',
            variant === 'underline' && [
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700',
            ],
            variant === 'pills' && [
              'rounded-md',
              activeTab === tab.id
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700',
            ]
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 text-caption rounded-full font-medium',
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'bg-neutral-200 text-neutral-600'
            )}>
              {tab.count}
            </span>
          )}
          {variant === 'underline' && activeTab === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {variant === 'pills' && activeTab === tab.id && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              style={{ zIndex: -1 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
