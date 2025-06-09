import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankDisplay } from '../helpers';
import {useApi} from "@/contexts/ApiProvider.jsx";

const TotalLeagueLeaderboard = ({ season = 'su_25', themeString, showUsernameColor }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useApi();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const endpoint = `/leagues/${season}`;
                const response = await api.get(endpoint);

                if (response.ok) {
                    setLeaderboardData(response.body.data);
                } else {
                    setError('Failed to fetch leaderboard');
                }
            } catch (err) {
                setError('Failed to fetch leaderboard data');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [season]);

    const calculateRanks = (data) => {
        return data.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-tBase">Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    const rankedData = calculateRanks(leaderboardData);

    return (
        <div className="w-full">
            <Card className="border-0 bg-fgPrimary rounded-none overflow-hidden z-12">
                <CardContent className="p-8">
                    <Table>
                        <TableHeader className="bg-fgSecondary">
                            <TableRow className="hover:bg-fgSecondary">
                                <TableHead className="w-16 text-tDarkBg font-poppins">Rank</TableHead>
                                <TableHead className="text-tDarkBg font-poppins">Username</TableHead>
                                <TableHead className="text-tDarkBg text-right font-poppins">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-fgThird">
                            {rankedData.map((user) => (
                                <TableRow key={`${user.name}-${user.total_points}`} className="border-b-bBase hover:bg-fgSecondary">
                                    <TableCell className="text-center">
                                        {getRankDisplay(user.rank, 8, 8)}
                                    </TableCell>
                                    <TableCell className={`
                                        font-poppins
                                        hover:underline
                                        ${themeString}
                                        ${showUsernameColor && user.colorname ? "" : "text-tBase"}
                                    `}
                                               style={(showUsernameColor && user.colorname) ? {color: user.colorname} : {}}
                                    >
                                        <span
                                            className={`fi fi-${user.flag?.toLowerCase()} ml-4 mr-1`}
                                            title={user.flag}
                                            style={{fontSize: '1rem'}}
                                        />
                                        <a href={`/profile/${user.name}`} className="hover:underline">
                                            {user.name}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right pr-3 font-poppins text-tBase">
                                        {user.total_points?.toLocaleString() || 0}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {rankedData.length === 0 && (
                        <div className="text-center py-8 text-tBase">
                            No leaderboard data available for this season.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TotalLeagueLeaderboard;