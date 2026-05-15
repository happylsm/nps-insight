'use client'

import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus,
  Wallet, PieChart as PieChartIcon, Activity, ChevronUp, ChevronDown,
} from 'lucide-react'
import type { NPSData, StockHolding, ChangeType } from '../_lib/getNPSData'

// ── 색상 ─────────────────────────────────────────────
const CHART_COLORS = [
  '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa',
  '#0f766e', '#0d9488', '#14b8a6', '#64748b', '#94a3b8',
]

const SECTOR_STYLE: Record<string, string> = {
  '반도체':    'bg-violet-50 text-violet-700 border border-violet-200',
  '금융':      'bg-blue-50 text-blue-700 border border-blue-200',
  '바이오':    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '배터리':    'bg-amber-50 text-amber-700 border border-amber-200',
  '자동차':    'bg-orange-50 text-orange-700 border border-orange-200',
  '철강':      'bg-slate-100 text-slate-700 border border-slate-300',
  'IT서비스':  'bg-cyan-50 text-cyan-700 border border-cyan-200',
  '자동차부품':'bg-red-50 text-red-700 border border-red-200',
  '보험':      'bg-indigo-50 text-indigo-700 border border-indigo-200',
  '화학':      'bg-lime-50 text-lime-700 border border-lime-200',
}

// ── 유틸 ─────────────────────────────────────────────
function formatAUM(eok: number): string {
  const jo = eok / 10_000
  return `${jo.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}조 원`
}

function formatShares(shares: number): string {
  return shares.toLocaleString('ko-KR') + '주'
}

function formatValueKRW(eok: number): string {
  if (eok >= 10_000) {
    const jo = Math.floor(eok / 10_000)
    const rem = eok % 10_000
    return `${jo.toLocaleString()}조 ${rem.toLocaleString()}억`
  }
  return `${eok.toLocaleString()}억`
}

function sectorStyle(sector: string): string {
  return SECTOR_STYLE[sector] ?? 'bg-slate-50 text-slate-600 border border-slate-200'
}

// ── 서브 컴포넌트 ─────────────────────────────────────

function ChangeCell({ h }: { h: StockHolding }) {
  const diff = (h.stakePercent - h.prevStakePercent).toFixed(2)
  const isUp = h.changeType === 'increase'
  const isDown = h.changeType === 'decrease'
  if (isUp) return (
    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium text-xs">
      <ChevronUp size={13} strokeWidth={2.5} />+{diff}%p
    </span>
  )
  if (isDown) return (
    <span className="inline-flex items-center gap-0.5 text-red-500 font-medium text-xs">
      <ChevronDown size={13} strokeWidth={2.5} />{diff}%p
    </span>
  )
  return <span className="text-slate-400 text-xs">-</span>
}

function SummaryCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ?? 'bg-[#0B1E3D]'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 tracking-wide uppercase mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── 차트 커스텀 툴팁 ──────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: StockHolding }> }) {
  if (!active || !payload?.length) return null
  const h = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900 mb-1">{h.name}</p>
      <p className="text-slate-500">종목코드 <span className="text-slate-700 font-mono">{h.code}</span></p>
      <p className="text-slate-500">포트 비중 <span className="text-[#1d4ed8] font-semibold">{h.portfolioWeight}%</span></p>
      <p className="text-slate-500">평가액 <span className="text-slate-700">{formatValueKRW(h.valueKRW)}</span></p>
    </div>
  )
}

// ── 차트 범례 ──────────────────────────────────────────
function ChartLegend({ holdings }: { holdings: StockHolding[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 px-2">
      {holdings.map((h, i) => (
        <div key={h.code} className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="text-xs text-slate-600 truncate">{h.name}</span>
          <span className="text-xs text-slate-400 ml-auto shrink-0">{h.portfolioWeight}%</span>
        </div>
      ))}
    </div>
  )
}

// ── 보유 테이블 ────────────────────────────────────────
function HoldingsTable({ holdings }: { holdings: StockHolding[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200">
          {['순위', '종목명', '섹터', '보유 주식수', '평가액', '포트 비중', '지분율', '전분기 대비'].map(th => (
            <th
              key={th}
              className="pb-3 text-left text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap pr-4 last:pr-0"
            >
              {th}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {holdings.map((h, idx) => (
          <tr
            key={h.code}
            className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-blue-50/40' : ''}`}
          >
            <td className="py-3 pr-4">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                ${h.rank <= 3 ? 'bg-[#0B1E3D] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {h.rank}
              </span>
            </td>
            <td className="py-3 pr-4">
              <p className="font-semibold text-slate-900 whitespace-nowrap">{h.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{h.code}</p>
            </td>
            <td className="py-3 pr-4">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${sectorStyle(h.sector)}`}>
                {h.sector}
              </span>
            </td>
            <td className="py-3 pr-4 text-right">
              <span className="text-slate-700 font-mono text-xs whitespace-nowrap">
                {formatShares(h.shares)}
              </span>
            </td>
            <td className="py-3 pr-4 text-right">
              <span className="text-slate-900 font-semibold whitespace-nowrap">
                {formatValueKRW(h.valueKRW)}
              </span>
            </td>
            <td className="py-3 pr-4 text-right">
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold text-[#1d4ed8]">{h.portfolioWeight.toFixed(2)}%</span>
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1d4ed8] rounded-full"
                    style={{ width: `${Math.min((h.portfolioWeight / 4) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </td>
            <td className="py-3 pr-4 text-right">
              <span className="font-semibold text-slate-800">{h.stakePercent.toFixed(2)}%</span>
            </td>
            <td className="py-3">
              <ChangeCell h={h} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── 메인 대시보드 ─────────────────────────────────────
type Tab = 'top10' | 'stake5'

export default function NPSDashboard({ data }: { data: NPSData }) {
  const [activeTab, setActiveTab] = useState<Tab>('top10')

  const allHoldings = [...data.top10Holdings, ...data.majorStakeHoldings]
  const changedCount = allHoldings.filter(h => h.changeType !== 'none').length
  const increaseCount = allHoldings.filter(h => h.changeType === 'increase').length
  const decreaseCount = allHoldings.filter(h => h.changeType === 'decrease').length
  const tableData = activeTab === 'top10' ? data.top10Holdings : data.majorStakeHoldings

  const reportDateFormatted = data.reportDate.replace(/-/g, '.')

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── 헤더 ── */}
      <header style={{ backgroundColor: '#0B1E3D' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
              <PieChartIcon size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">NPS Insight</h1>
              <p className="text-blue-300 text-xs mt-0.5">국민연금 포트폴리오 인사이트</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-xs">데이터 기준일</span>
            <span className="text-white text-sm font-semibold">{reportDateFormatted}</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* ── 요약 카드 ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            icon={<Wallet size={18} className="text-white" />}
            label="총 운용자산"
            value={formatAUM(data.totalAUM)}
            sub={`${data.totalAUM.toLocaleString('ko-KR')}억 원`}
          />
          <SummaryCard
            icon={<Activity size={18} className="text-white" />}
            label="국내주식 비중"
            value={`${data.domesticEquityRatio}%`}
            sub="전체 포트폴리오 내 국내주식 비율"
            accent="bg-blue-600"
          />
          <SummaryCard
            icon={<TrendingUp size={18} className="text-white" />}
            label="주요변동 종목 수"
            value={`${changedCount}개`}
            sub={`▲ 증가 ${increaseCount}개 · ▼ 감소 ${decreaseCount}개`}
            accent="bg-indigo-600"
          />
        </section>

        {/* ── 메인 영역: 차트 + 테이블 ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 좌측: 파이 차트 */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">보유 비중 차트</h2>
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                평가액 상위 10
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">전체 포트폴리오 대비 비중 (%)</p>

            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.top10Holdings}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="portfolioWeight"
                  >
                    {data.top10Holdings.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ChartLegend holdings={data.top10Holdings} />
          </div>

          {/* 우측: 상세 테이블 */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">

            {/* 테이블 헤더 + 탭 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0 gap-4 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">상세 보유 현황</h2>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium shrink-0">
                <button
                  onClick={() => setActiveTab('top10')}
                  className={`px-4 py-2 transition-colors ${
                    activeTab === 'top10'
                      ? 'bg-[#0B1E3D] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  평가액 상위 10
                </button>
                <button
                  onClick={() => setActiveTab('stake5')}
                  className={`px-4 py-2 border-l border-slate-200 transition-colors ${
                    activeTab === 'stake5'
                      ? 'bg-[#0B1E3D] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  5% 이상 지분
                </button>
              </div>
            </div>

            {/* 탭 설명 */}
            <p className="px-6 pt-2 pb-3 text-xs text-slate-500 border-b border-slate-100">
              {activeTab === 'top10'
                ? `국민연금 평가액 기준 상위 10개 국내주식 종목 (기준일: ${reportDateFormatted})`
                : `국민연금 지분율 5% 이상 보유 종목 (상위 10개 미포함)`}
            </p>

            {/* 스크롤 테이블 */}
            <div className="overflow-auto flex-1 px-6 pb-6">
              <div style={{ minWidth: 680 }}>
                <HoldingsTable holdings={tableData} />
              </div>
            </div>

            {/* 테이블 푸터 */}
            <div className="px-6 pb-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                총 <span className="font-semibold text-slate-600">{tableData.length}</span>개 종목
              </span>
              <span className="text-xs text-slate-400">출처: 국민연금공단 공시자료 (DUMMY)</span>
            </div>
          </div>
        </section>

        {/* ── 면책 고지 ── */}
        <footer className="text-center text-xs text-slate-400 pb-4">
          본 페이지는 공시 데이터를 기반으로 한 정보 제공 목적이며, 투자 권유가 아닙니다.
          데이터 기준일: {reportDateFormatted}
        </footer>
      </main>
    </div>
  )
}
