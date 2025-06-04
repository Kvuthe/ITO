import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useApi } from '../contexts/ApiProvider';
import { getRankDisplay } from "@/helpers.jsx";

const TotalLeagueComponent = ({ themeString }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const api = useApi();

    const fakeData = [
        { id: 1, username: 'Matt', points: 5670, username_color: '#ff7700', flag: 'US' },
        { id: 2, username: 'DoriIsBad', points: 4980, username_color: '#00aaff', flag: 'CA' },
        { id: 3, username: 'DoriSux', points: 4520, username_color: '#ffdd00', flag: 'GB' },
        { id: 4, username: 'Dori', points: 4210, username_color: '#ff00aa', flag: 'JP' },
        { id: 5, username: 'Solorenektononly', points: 3980, username_color: '#00ff7f', flag: 'DE' },
        { id: 6, username: 'Father Fortunate', points: 3750, username_color: '#aa00ff', flag: 'FR' },
        { id: 7, username: 'Bytez', points: 3420, username_color: '#ff0000', flag: 'KR' },
        { id: 8, username: 'Logan', points: 3190, username_color: '#0000ff', flag: 'BR' }
    ];

    useEffect(() => {
        const fetchTotalLeagueData = async () => {
            setLoading(true);
            setError(null);

            try {
                const endpoint = '/leagues/scoring/total';
                const response = await api.get(endpoint);

                if (!response.ok) {
                    throw new Error('Failed to fetch total league data');
                }

                const data = await response.json();
                setLeaderboardData(data);
            } catch (err) {
                console.error('Error fetching total league data:', err);
                setLeaderboardData(fakeData);
            } finally {
                setLoading(false);
            }
        };

        fetchTotalLeagueData();
    }, []);

    const calculateRanks = (data) => {
        if (!data || data.length === 0) return [];

        const sortedData = [...data].sort((a, b) => b.points - a.points);

        let currentRank = 1;
        let prevScore = null;
        let skipCount = 0;

        return sortedData.map((user, index) => {
            if (prevScore !== null && prevScore !== user.points) {
                currentRank += skipCount + 1;
                skipCount = 0;
            } else if (index > 0) {
                skipCount++;
            }

            prevScore = user.points;

            return {
                ...user,
                rank: currentRank
            };
        });
    };

    return (
        <Card className="border-0 bg-fgPrimary rounded-lg overflow-hidden mb-6">
            <CardHeader className="bg-fgSecondary p-2 pl-4">
                <CardTitle className="text-tDarkBg font-poppins text-md">Season Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <div className="text-center py-6 text-tBase">
                        Loading total league data...
                    </div>
                ) : error ? (
                    <div className="text-center py-6 text-red-500">Error loading data: {error}</div>
                ) : leaderboardData && leaderboardData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-fgSecondary">
                                <TableRow>
                                    <TableHead className="w-16 text-tDarkBg font-poppins">Rank</TableHead>
                                    <TableHead className="text-tDarkBg font-poppins">Username</TableHead>
                                    <TableHead className="text-tDarkBg text-right font-poppins">Total Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-fgThird">
                                {calculateRanks(leaderboardData).map((user) => (
                                    <TableRow key={user.id} className="border-b-bBase hover:bg-fgSecondary">
                                        <TableCell className="text-center">
                                            {getRankDisplay(user.rank)}
                                        </TableCell>
                                        <TableCell
                                            className={`font-poppins hover:underline text-tBase ${themeString}`}
                                            style={{ color: user.username_color }}
                                        >
                                            <span
                                                className={`fi fi-${user.flag.toLowerCase()} ml-4 mr-1`}
                                                title={user.flag}
                                                style={{fontSize: '1rem'}}
                                            />
                                            <Link
                                                to={`/profile/${user.username}`}
                                            >
                                                {user.username}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right pr-3 font-poppins text-tBase">
                                            {user.points}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-6 text-tBase">
                        No total league data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TotalLeagueComponent;