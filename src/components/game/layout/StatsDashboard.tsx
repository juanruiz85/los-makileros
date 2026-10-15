'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { X, BarChart3, TrendingUp, Calendar, Award, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAchievementStore, ACHIEVEMENT_DEFS } from '@/game/store/achievementStore'
import { useDailyChallengeStore } from '@/game/store/dailyChallengeStore'
import { useGameStore } from '@/game/store/gameStore'

interface StatsDashboardProps {
  open: boolean
  onOpenChange: (b: boolean) => void
}

interface SessionLog {
  id: string
  mode: string
  durationSec: number
  ticketsCompleted: number
  finalScore: number
  errors: number
  gringoEncounters: number
  createdAt: string
}

const PIE_COLORS = ['#f59e0b', '#dc2626', '#16a34a']

export function StatsDashboard({ open, onOpenChange }: StatsDashboardProps) {
  const achievementStore = useAchievementStore()
  const dailyStore = useDailyChallengeStore()
  const highscore = useGameStore((s) => s.highscore)
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      fetch('/api/sessions', { method: 'GET' })
        .then((r) => (r.ok ? r.json() : { sessions: [] }))
        .then((data) => setSessions(data.sessions ?? []))
        .catch(() => setSessions([]))
        .finally(() => setLoading(false))
    }
  }, [open])

  // Compute charts data
  const recentSessions = sessions.slice(-15) // last 15 sessions
  const lineData = recentSessions.map((s, i) => ({
    name: `#${i + 1}`,
    score: s.finalScore,
    tickets: s.ticketsCompleted,
  }))

  // Mode distribution
  const modeCounts = sessions.reduce(
    (acc, s) => {
      acc[s.mode] = (acc[s.mode] ?? 0) + 1
      return acc
    },
    { normal: 0, chaos: 0, free: 0 } as Record<string, number>
  )
  const pieData = Object.entries(modeCounts).map(([name, value]) => ({ name, value }))

  // Total time played
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSec, 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  // Average score per session
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.finalScore, 0) / sessions.length)
    : 0

  // Total errors
  const totalErrors = sessions.reduce((sum, s) => sum + s.errors, 0)
  const totalGringos = sessions.reduce((sum, s) => sum + s.gringoEncounters, 0)

  // Achievements stats
  const unlockedCount = Object.keys(achievementStore.unlocked).length
  const totalAch = ACHIEVEMENT_DEFS.length

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-5 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-stone-900 -mx-5 px-5 py-2 z-10 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-stone-900" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    Estadísticas
                  </div>
                  <div className="text-lg font-black text-stone-100">
                    Stats Dashboard
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <KPICard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Highscore"
                value={highscore.toLocaleString()}
                color="text-amber-400"
              />
              <KPICard
                icon={<Calendar className="w-4 h-4" />}
                label="Sesiones"
                value={sessions.length.toString()}
                color="text-emerald-400"
              />
              <KPICard
                icon={<Award className="w-4 h-4" />}
                label="Logros"
                value={`${unlockedCount}/${totalAch}`}
                color="text-purple-400"
              />
              <KPICard
                icon={<Flame className="w-4 h-4" />}
                label="Racha Daily"
                value={`${dailyStore.streak}d`}
                color="text-orange-400"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-stone-400 text-xs font-mono">
                Cargando sesiones...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <div className="text-xs font-mono">
                  Aún no hay sesiones registradas. ¡Juega una partida!
                </div>
              </div>
            ) : (
              <>
                {/* Score progression chart */}
                <div className="mb-5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                    Progresión de score (últimas {recentSessions.length} sesiones)
                  </div>
                  <div className="bg-stone-950 border border-stone-700 rounded-lg p-2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                        <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#a8a29e', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1c1917',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mode distribution pie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                      Distribución por modo
                    </div>
                    <div className="bg-stone-950 border border-stone-700 rounded-lg p-2 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1c1917',
                              border: '1px solid #f59e0b',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tickets per session bar chart */}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                      Tickets por sesión
                    </div>
                    <div className="bg-stone-950 border border-stone-700 rounded-lg p-2 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={lineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                          <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#a8a29e', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1c1917',
                              border: '1px solid #f59e0b',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="tickets" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <SummaryStat label="Tiempo total" value={`${totalHours}h ${totalMinutes}m`} />
                  <SummaryStat label="Promedio score" value={avgScore.toLocaleString()} />
                  <SummaryStat label="Errores totales" value={totalErrors.toString()} color="text-red-400" />
                  <SummaryStat label="Visitas Gringo" value={totalGringos.toString()} color="text-orange-400" />
                </div>
              </>
            )}

            {/* Cumulative stats */}
            <div className="mt-5 pt-4 border-t border-stone-700">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-2">
                Stats acumuladas
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <SummaryStat label="Tickets totales" value={achievementStore.totalTicketsAllTime.toString()} />
                <SummaryStat label="Score acumulado" value={achievementStore.totalScoreAcrossRuns.toLocaleString()} />
                <SummaryStat label="Cafés tomados" value={achievementStore.coffeeConsumed.toString()} />
                <SummaryStat label="Tacos comidos" value={achievementStore.tacosConsumed.toString()} />
                <SummaryStat label="Splices hechos" value={achievementStore.splicesCompleted.toString()} />
                <SummaryStat label="Prensas hechas" value={achievementStore.pressesCompleted.toString()} />
                <SummaryStat label="Pruebas eléctricas OK" value={achievementStore.harnessTestsPassed.toString()} />
                <SummaryStat label="Encuentros con Gringo" value={achievementStore.totalGringosAllTime.toString()} />
                <SummaryStat label="Daily challenges completadas" value={dailyStore.totalCompleted.toString()} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-2 text-center">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
      </div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-stone-400">
        {label}
      </div>
      <div className={`font-black text-lg ${color} tabular-nums`}>{value}</div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  color = 'text-stone-100',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-stone-800/30 border border-stone-700 rounded p-2">
      <div className="text-[9px] font-mono uppercase tracking-widest text-stone-400">
        {label}
      </div>
      <div className={`font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  )
}
