import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../lib/axios.js';
import Badge from '../components/Badge.jsx';
import Navbar from '../components/Navbar.jsx';

const MyProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achievements/my-progress');
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getProgressLevel = (points) => {
    if (points >= 1000) return { level: 'Master', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 500) return { level: 'Expert', color: 'text-gold-600', bg: 'bg-yellow-100' };
    if (points >= 200) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (points >= 50) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = getProgressLevel(progressData.totalPoints);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Progress</h1>
          <p className="text-base-content/60">Track your achievements and academic progress</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Points */}
          <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{progressData.totalPoints}</div>
                  <div className="text-primary-content/80">Total Points</div>
                </div>
                <Trophy className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Total Achievements */}
          <div className="card bg-gradient-to-br from-secondary to-secondary-focus text-secondary-content">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{progressData.totalAchievements}</div>
                  <div className="text-secondary-content/80">Achievements</div>
                </div>
                <Award className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Level */}
          <div className={`card bg-gradient-to-br from-accent to-accent-focus text-accent-content`}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{levelInfo.level}</div>
                  <div className="text-accent-content/80">Current Level</div>
                </div>
                <Star className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Badge Summary */}
          <div className="card bg-gradient-to-br from-info to-info-focus text-info-content">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">
                    {progressData.badgeCounts.platinum}P {progressData.badgeCounts.gold}G {progressData.badgeCounts.silver}S {progressData.badgeCounts.bronze}B
                  </div>
                  <div className="text-info-content/80">Badge Collection</div>
                </div>
                <Target className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Achievements */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">
                  <Calendar className="h-6 w-6" />
                  Recent Achievements
                </h2>
                
                {progressData.recentAchievements.length === 0 ? (
                  <div className="text-center py-8 text-base-content/60">
                    <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>No achievements yet. Keep working to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progressData.recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <Badge achievement={achievement.achievement} size="sm" />
                        <div className="flex-1">
                          <div className="font-semibold">{achievement.achievement.name}</div>
                          <div className="text-sm text-base-content/60">{achievement.achievement.description}</div>
                          <div className="text-xs text-base-content/50 mt-1">
                            {achievement.room.name} • {new Date(achievement.dateEarned).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">+{achievement.pointsEarned}</div>
                          <div className="text-xs text-base-content/60">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badge Collection */}
          <div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">
                  <Trophy className="h-6 w-6" />
                  Badge Collection
                </h2>
                
                {/* Badge Counts */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg">
                    <div className="text-2xl font-bold">{progressData.badgeCounts.platinum}</div>
                    <div className="text-sm">Platinum</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg">
                    <div className="text-2xl font-bold">{progressData.badgeCounts.gold}</div>
                    <div className="text-sm">Gold</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{progressData.badgeCounts.silver}</div>
                    <div className="text-sm">Silver</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg">
                    <div className="text-2xl font-bold">{progressData.badgeCounts.bronze}</div>
                    <div className="text-sm">Bronze</div>
                  </div>
                </div>

                {/* Progress to next level */}
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">Progress to Next Level</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <progress 
                        className="progress progress-primary w-full" 
                        value={progressData.totalPoints % 100} 
                        max="100"
                      ></progress>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {progressData.totalPoints % 100}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress by Room */}
        {progressData.achievementsByRoom.length > 0 && (
          <div className="mt-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">
                  <TrendingUp className="h-6 w-6" />
                  Progress by Room
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {progressData.achievementsByRoom.map((roomData, index) => (
                    <div key={index} className="p-6 bg-base-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">{roomData.room.name}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{roomData.points}</div>
                          <div className="text-xs text-base-content/60">points</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {roomData.achievements.slice(0, 6).map((achievement, achIndex) => (
                          <Badge 
                            key={achIndex} 
                            achievement={achievement.achievement} 
                            size="sm" 
                          />
                        ))}
                      </div>
                      
                      <div className="text-center">
                        <span className="text-sm text-base-content/60">
                          {roomData.achievements.length} achievement{roomData.achievements.length !== 1 ? 's' : ''} earned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProgress;
