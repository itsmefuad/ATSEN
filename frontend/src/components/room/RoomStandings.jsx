import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import api from '../../lib/axios.js';
import Badge from '../Badge.jsx';

const RoomStandings = ({ roomId }) => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
  }, [roomId]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/achievements/room/${roomId}/standings`);
      setStandings(response.data);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setError('Failed to load standings');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
    return <span className="h-6 w-6 flex items-center justify-center font-bold text-base-content/60">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
    return 'bg-base-100 border-base-200';
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-center items-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <h2 className="card-title text-2xl">Room Standings</h2>
        </div>

        {standings.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>No achievements yet. Complete assessments to start earning points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {standings.map((studentData) => (
              <div 
                key={studentData.student._id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                  ${getRankBg(studentData.rank)}
                `}
              >
                <div className="flex items-center justify-between">
                  {/* Rank and Student Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(studentData.rank)}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-lg">
                        {studentData.student.name}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {studentData.student.email}
                      </div>
                    </div>
                  </div>

                  {/* Points and Badges */}
                  <div className="flex items-center gap-6">
                    {/* Badge Counts */}
                    <div className="flex items-center gap-3">
                      {studentData.badgeCounts.platinum > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
                          <span className="text-sm font-medium">{studentData.badgeCounts.platinum}</span>
                        </div>
                      )}
                      {studentData.badgeCounts.gold > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"></div>
                          <span className="text-sm font-medium">{studentData.badgeCounts.gold}</span>
                        </div>
                      )}
                      {studentData.badgeCounts.silver > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
                          <span className="text-sm font-medium">{studentData.badgeCounts.silver}</span>
                        </div>
                      )}
                      {studentData.badgeCounts.bronze > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
                          <span className="text-sm font-medium">{studentData.badgeCounts.bronze}</span>
                        </div>
                      )}
                    </div>

                    {/* Total Points */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {studentData.totalPoints}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {studentData.achievements.length} achievement{studentData.achievements.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Badges */}
                {studentData.achievements.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-base-300">
                    <div className="text-sm text-base-content/60 mb-2">Recent Achievements:</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {studentData.achievements.slice(0, 5).map((sa, index) => (
                        <div key={index} className="flex-shrink-0">
                          <Badge achievement={sa.achievement} size="sm" />
                        </div>
                      ))}
                      {studentData.achievements.length > 5 && (
                        <div className="flex items-center text-xs text-base-content/60 ml-2">
                          +{studentData.achievements.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomStandings;
