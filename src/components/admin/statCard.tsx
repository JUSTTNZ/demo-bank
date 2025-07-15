import { StatCardProps } from '@/types/adminTypes'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  description,
  trendIcon: TrendIcon,
  trendColor 
}: StatCardProps) => {
  const isPositiveTrend = trend && !trend.startsWith('-')
  
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-gray-300/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && TrendIcon && (
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPositiveTrend 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <TrendIcon className={`w-3 h-3 mr-1 ${trendColor || (isPositiveTrend ? 'text-green-600' : 'text-red-600')}`} />
              {trend}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      </div>
    </div>
  )
}

export default StatCard