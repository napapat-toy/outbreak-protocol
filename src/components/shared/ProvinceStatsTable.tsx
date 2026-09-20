'use client';

import { useMemo, useState } from 'react';
import { formatNumber, formatPercent, getProvinceStatus } from '../../lib/format-utils';
import { Province, ProvinceState } from '../../lib/types';
import { cn } from '../../lib/utils';

export type SortField = 'name' | 'pop' | 'infected' | 'recovered' | 'dead' | 'unrest';
export type SortOrder = 'asc' | 'desc';

interface ProvinceStatsTableProps {
  provinces: Province[];
  provinceStates: Record<string, ProvinceState>;
  onSelectProvince?: (provinceId: string) => void;
  selectedProvinceId?: string | null;
  compact?: boolean;
}

export function ProvinceStatsTable({
  provinces,
  provinceStates,
  onSelectProvince,
  selectedProvinceId,
  compact = false,
}: ProvinceStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('infected');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedProvinces = useMemo(() => {
    return [...provinces].sort((a, b) => {
      const stateA = provinceStates[a.id];
      const stateB = provinceStates[b.id];
      if (!stateA || !stateB) return 0;

      let valA = 0;
      let valB = 0;

      switch (sortField) {
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name, 'th')
            : b.name.localeCompare(a.name, 'th');
        case 'pop':
          valA = a.pop;
          valB = b.pop;
          break;
        case 'infected':
          valA = stateA.infected;
          valB = stateB.infected;
          break;
        case 'recovered':
          valA = stateA.recovered;
          valB = stateB.recovered;
          break;
        case 'dead':
          valA = stateA.dead;
          valB = stateB.dead;
          break;
        case 'unrest':
          valA = stateA.unrest;
          valB = stateB.unrest;
          break;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [provinces, provinceStates, sortField, sortOrder]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-[10px] text-indigo-400 font-mono">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="table-container">
      <table className="table-base">
        <thead className="table-header">
          <tr>
            <th
              onClick={() => handleSort('name')}
              className="table-header-cell"
            >
              <div className="flex items-center">
                <span>จังหวัด</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th
              onClick={() => handleSort('pop')}
              className="table-header-cell"
            >
              <div className="flex items-center">
                <span>ประชากร</span>
                {renderSortIndicator('pop')}
              </div>
            </th>
            <th
              onClick={() => handleSort('infected')}
              className="table-header-cell text-rose-400 hover:text-rose-300"
            >
              <div className="flex items-center">
                <span>ติดเชื้อ</span>
                {renderSortIndicator('infected')}
              </div>
            </th>
            <th
              onClick={() => handleSort('recovered')}
              className="table-header-cell text-emerald-400 hover:text-emerald-300"
            >
              <div className="flex items-center">
                <span>หายแล้ว</span>
                {renderSortIndicator('recovered')}
              </div>
            </th>
            <th
              onClick={() => handleSort('dead')}
              className="table-header-cell"
            >
              <div className="flex items-center">
                <span>ตาย</span>
                {renderSortIndicator('dead')}
              </div>
            </th>
            <th
              onClick={() => handleSort('unrest')}
              className="table-header-cell text-amber-400 hover:text-amber-300"
            >
              <div className="flex items-center">
                <span>Unrest</span>
                {renderSortIndicator('unrest')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="table-body">
          {sortedProvinces.map((p) => {
            const s = provinceStates[p.id];
            if (!s) return null;

            const status = getProvinceStatus(s, p.pop);
            const isSelected = selectedProvinceId === p.id;
            const isClickable = Boolean(onSelectProvince);

            return (
              <tr
                key={p.id}
                onClick={() => onSelectProvince?.(p.id)}
                className={cn(
                  'transition-colors select-none',
                  isSelected
                    ? 'bg-indigo-950/60 border-l-2 border-indigo-500'
                    : 'table-row-hover',
                  isClickable && 'cursor-pointer'
                )}
                title={isClickable ? `คลิกเพื่อกระโดดไปยัง ${p.name} บนแผนที่` : undefined}
              >
                {/* Province Name & Status Icon */}
                <td className="p-2.5 font-sans font-medium text-white flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm" title={status.label}>
                    {status.icon}
                  </span>
                  <span>{p.name}</span>
                  {p.hub && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                      HUB
                    </span>
                  )}
                </td>

                {/* Population */}
                <td className="p-2.5 text-[11px] text-slate-400">
                  {formatNumber(p.pop)}
                </td>

                {/* Infected */}
                <td className="p-2.5 text-[11px] text-rose-400 font-bold">
                  <div>{formatNumber(s.infected)}</div>
                  {!compact && (
                    <div className="text-[9px] text-rose-400/70 font-normal">
                      ({formatPercent(status.infectedPct, 1)})
                    </div>
                  )}
                </td>

                {/* Recovered */}
                <td className="p-2.5 text-[11px] text-emerald-400">
                  <div>{formatNumber(s.recovered)}</div>
                  {!compact && (
                    <div className="text-[9px] text-emerald-400/70 font-normal">
                      ({formatPercent(p.pop > 0 ? (s.recovered / p.pop) * 100 : 0, 1)})
                    </div>
                  )}
                </td>

                {/* Dead */}
                <td className="p-2.5 text-[11px] text-slate-400">
                  <div>{formatNumber(s.dead)}</div>
                  {!compact && s.dead > 0 && (
                    <div className="text-[9px] text-slate-500 font-normal">
                      ({formatPercent(status.deadPct, 2)})
                    </div>
                  )}
                </td>

                {/* Unrest */}
                <td className="p-2.5 text-[11px] text-amber-400 font-bold">
                  <div className="flex items-center gap-1">
                    <span>{Math.round(s.unrest)}%</span>
                    {s.rioting && (
                      <span className="text-[10px] text-rose-400 animate-pulse">🔥</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
