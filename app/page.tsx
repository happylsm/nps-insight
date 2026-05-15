import NPSDashboard from './_components/NPSDashboard'
import { getNPSData } from './_lib/getNPSData'

export default async function Home() {
  const data = await getNPSData()
  return <NPSDashboard data={data} />
}
