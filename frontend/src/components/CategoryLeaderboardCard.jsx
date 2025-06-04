import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { getRankDisplay } from "../helpers.jsx"
import { useApi } from '../contexts/ApiProvider';
import { Link } from "react-router-dom";

const CategoryLeaderboardCard = () => {
    const api = useApi();
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = `/leaderboard/users/total`;
            const response = await api.get(endpoint);

            if (response.ok) {
                setLeaderboardData(response.body.data);
            } else {
                console.error("Error fetching total leaderboard:", response.status);
            }
        } catch (error) {
            setError(error.message || "An error occurred while fetching total leaderboard data.");
            console.error("Error in total leaderboard fetch:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const calculateRanks = (data) => {
        if (!data || data.length === 0) return [];

        const rankedData = [...data];
        let currentRank = 1;
        let playersAtCurrentScore = 1;

        rankedData[0].rank = currentRank;

        for (let i = 1; i < rankedData.length; i++) {
            if (rankedData[i].score === rankedData[i-1].score) {
                rankedData[i].rank = currentRank;
                playersAtCurrentScore++;
            } else {
                currentRank += playersAtCurrentScore;
                rankedData[i].rank = currentRank;
                playersAtCurrentScore = 1;
            }
        }

        return rankedData;
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Tabs defaultValue="recent" className="relative">
                <div className="-top-10 z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <Link to={"/user_leaderboard"} className="text-sm font-poppins text-tBase pl-3 pr-3 no-underline hover:underline">
                            Points Leaderboard
                        </Link>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="border-0 bg-fgPrimary rounded-none overflow-hidden">
                        <CardContent className="p-2">
                            {loading ? (
                                <div className="text-center py-6 text-white">Loading total leaderboard data...</div>
                            ) : error ? (
                                <div className="text-center py-6 text-red-500">Error loading data: {error}</div>
                            ) : leaderboardData ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableBody className="bg-fgThird">
                                            {calculateRanks(leaderboardData).map((user) => (
                                                <TableRow key={user.id} className="border-b-bBase hover:bg-fgThird">
                                                    <TableCell
                                                        className="text-left">{getRankDisplay(user.rank)}</TableCell>
                                                    <TableCell className="text-left text-tBase font-poppins hover:underline">
                                                        <Link to={`/profile/${user.username}`}>
                                                            {user.username}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-3 font-poppins text-tBase">{user.score}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-tBase">No total leaderboard data available</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CategoryLeaderboardCard;