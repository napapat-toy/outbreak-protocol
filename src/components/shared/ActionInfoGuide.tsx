'use client';

import { ACTIONS } from '../../lib/constants';
import { ActionType } from '../../lib/types';

export function ActionInfoGuide() {
  const actionKeys = Object.keys(ACTIONS) as ActionType[];

  return (
    <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1.5 animate-fadeIn">
      {actionKeys.map((key) => {
        const action = ACTIONS[key];
        const isRelief = key === 'relief';

        return (
          <div
            key={key}
            className={`flex items-start gap-1.5 ${isRelief ? 'text-amber-300' : 'text-slate-200'}`}
          >
            <span className="text-xs">{action.icon}</span>
            <div>
              <span className="font-semibold text-white">
                {action.name} ({action.cost}G)
              </span>
              <span className="text-slate-400"> : {action.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
