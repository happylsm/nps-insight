export type ChangeType = 'increase' | 'decrease' | 'none'

export interface StockHolding {
  rank: number
  name: string
  code: string
  sector: string
  shares: number
  valueKRW: number         // 평가액 (억원)
  portfolioWeight: number  // 포트폴리오 비중 (%)
  stakePercent: number     // 지분율 (%)
  prevStakePercent: number // 전분기 지분율 (%)
  changeType: ChangeType
}

export interface NPSData {
  totalAUM: number              // 총 운용자산 (억원)
  domesticEquityRatio: number   // 국내주식 비중 (%)
  reportDate: string            // 보고 기준일
  top10Holdings: StockHolding[]
  majorStakeHoldings: StockHolding[]  // 5% 이상 지분 (top10 미포함)
}

const DUMMY_DATA: NPSData = {
  totalAUM: 10_234_567,
  domesticEquityRatio: 18.7,
  reportDate: '2025-03-31',
  top10Holdings: [
    {
      rank: 1, name: '삼성전자', code: '005930', sector: '반도체',
      shares: 823_456_789, valueKRW: 408_562,
      portfolioWeight: 3.99, stakePercent: 9.58, prevStakePercent: 9.72,
      changeType: 'decrease',
    },
    {
      rank: 2, name: 'SK하이닉스', code: '000660', sector: '반도체',
      shares: 63_241_567, valueKRW: 143_253,
      portfolioWeight: 1.40, stakePercent: 7.33, prevStakePercent: 7.21,
      changeType: 'increase',
    },
    {
      rank: 3, name: 'LG에너지솔루션', code: '373220', sector: '배터리',
      shares: 13_456_789, valueKRW: 56_765,
      portfolioWeight: 0.55, stakePercent: 5.63, prevStakePercent: 5.63,
      changeType: 'none',
    },
    {
      rank: 4, name: '삼성바이오로직스', code: '207940', sector: '바이오',
      shares: 4_123_456, valueKRW: 42_134,
      portfolioWeight: 0.41, stakePercent: 5.83, prevStakePercent: 5.71,
      changeType: 'increase',
    },
    {
      rank: 5, name: '현대차', code: '005380', sector: '자동차',
      shares: 15_678_901, valueKRW: 38_245,
      portfolioWeight: 0.37, stakePercent: 7.44, prevStakePercent: 7.56,
      changeType: 'decrease',
    },
    {
      rank: 6, name: 'POSCO홀딩스', code: '005490', sector: '철강',
      shares: 5_234_567, valueKRW: 21_543,
      portfolioWeight: 0.21, stakePercent: 6.23, prevStakePercent: 6.14,
      changeType: 'increase',
    },
    {
      rank: 7, name: '셀트리온', code: '068270', sector: '바이오',
      shares: 8_901_234, valueKRW: 19_234,
      portfolioWeight: 0.19, stakePercent: 6.12, prevStakePercent: 6.45,
      changeType: 'decrease',
    },
    {
      rank: 8, name: '삼성SDI', code: '006400', sector: '배터리',
      shares: 4_567_890, valueKRW: 18_456,
      portfolioWeight: 0.18, stakePercent: 6.56, prevStakePercent: 6.56,
      changeType: 'none',
    },
    {
      rank: 9, name: 'KB금융', code: '105560', sector: '금융',
      shares: 17_890_123, valueKRW: 17_234,
      portfolioWeight: 0.17, stakePercent: 8.67, prevStakePercent: 8.54,
      changeType: 'increase',
    },
    {
      rank: 10, name: '신한지주', code: '055550', sector: '금융',
      shares: 19_012_345, valueKRW: 15_678,
      portfolioWeight: 0.15, stakePercent: 9.23, prevStakePercent: 9.12,
      changeType: 'increase',
    },
  ],
  majorStakeHoldings: [
    {
      rank: 11, name: '기아', code: '000270', sector: '자동차',
      shares: 37_456_789, valueKRW: 13_567,
      portfolioWeight: 0.13, stakePercent: 9.34, prevStakePercent: 9.23,
      changeType: 'increase',
    },
    {
      rank: 12, name: 'NAVER', code: '035420', sector: 'IT서비스',
      shares: 8_234_567, valueKRW: 12_456,
      portfolioWeight: 0.12, stakePercent: 8.45, prevStakePercent: 8.67,
      changeType: 'decrease',
    },
    {
      rank: 13, name: '카카오', code: '035720', sector: 'IT서비스',
      shares: 23_456_789, valueKRW: 8_765,
      portfolioWeight: 0.09, stakePercent: 7.89, prevStakePercent: 7.76,
      changeType: 'increase',
    },
    {
      rank: 14, name: '삼성화재', code: '000810', sector: '보험',
      shares: 2_345_678, valueKRW: 6_543,
      portfolioWeight: 0.06, stakePercent: 7.23, prevStakePercent: 7.34,
      changeType: 'decrease',
    },
    {
      rank: 15, name: '현대모비스', code: '012330', sector: '자동차부품',
      shares: 5_678_901, valueKRW: 5_432,
      portfolioWeight: 0.05, stakePercent: 6.78, prevStakePercent: 6.65,
      changeType: 'increase',
    },
    {
      rank: 16, name: '하나금융지주', code: '086790', sector: '금융',
      shares: 12_345_678, valueKRW: 4_987,
      portfolioWeight: 0.05, stakePercent: 5.92, prevStakePercent: 5.78,
      changeType: 'increase',
    },
    {
      rank: 17, name: 'LG화학', code: '051910', sector: '화학',
      shares: 1_234_567, valueKRW: 4_321,
      portfolioWeight: 0.04, stakePercent: 5.34, prevStakePercent: 5.34,
      changeType: 'none',
    },
  ],
}

export async function getNPSData(): Promise<NPSData> {
  // TODO: Replace with actual API call
  // e.g. const res = await fetch(`${process.env.NPS_API_URL}/holdings`)
  //      return res.json()
  return DUMMY_DATA
}
