import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser } from "@/contexts/UserProvider.jsx";
import { useApi } from "@/contexts/ApiProvider.jsx";
import {getRankDisplay, BASE_API_URL, convertToEmbedUrl, getDaysAgo} from "@/helpers.jsx";
import {Link} from "react-router-dom";

export default function LeagueWeeklyLeaderboard({ themeString }) {
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [leagueButtons, setLeagueButtons] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingButtons, setLoadingButtons] = useState(true);
    const [expandedRun, setExpandedRun] = useState(null);

    const user = useUser();
    const api = useApi();

    const weeks = Array.from({ length: 8 }, (_, i) => i + 1); // Week 1-8

    useEffect(() => {
        fetchLeagueButtonsData();
    }, [selectedWeek]);

    const fetchLeagueButtonsData = async () => {
        setLoadingButtons(true);
        setError(null);

        try {
            const endpoint = `/leagues/buttons/su_25/week_${selectedWeek}`;
            const response = await api.get(endpoint);

            if (!response.ok) {
                throw new Error("Failed to fetch button data")
            }

            const buttonData = await response.body.data;

            const formattedButtons = Object.entries(buttonData).map(([levelId, levelData]) => {
                const imagePath = BASE_API_URL + '/api/' + levelData.background

                console.log(imagePath);

                const rankedPlayers = levelData.players.map((player, index) => ({
                    rank: index + 1,
                    username: player.user,
                    time: player.time_complete
                }));

                return {
                    id: parseInt(levelId),
                    title: levelData.name,
                    backgroundImage: imagePath,
                    category: levelData.category,
                    players: rankedPlayers,
                };
            });

            formattedButtons.sort((a, b) => a.id - b.id)
            setLeagueButtons(formattedButtons);
        } catch (err) {
            console.error(err);
            const mockLeagueData = [
                {
                    id: 1,
                    title: "Biting The Dust",
                    backgroundImage: "/src/assets/league_backgrounds/BitingTheDust.jpg",
                    players: [
                        { rank: 1, username: `Matt`, time: "1:23.45" },
                        { rank: 2, username: `Dori`, time: "1:24.78" },
                        { rank: 3, username: `Bytez`, time: "1:29.33" }
                    ]
                },
                {
                    id: 2,
                    title: "Biting The Dust2",
                    backgroundImage: "/src/assets/league_backgrounds/BitingTheDust.jpg",
                    players: [
                        { rank: 1, username: `Argros`, time: "3:12.51" },
                        { rank: 2, username: `Matt`, time: "3:45.22" },
                        { rank: 3, username: `Daemonweave`, time: "4:01.67" }
                    ]
                },
                {
                    id: 3,
                    title: "Biting The Dust3",
                    backgroundImage: "/src/assets/league_backgrounds/BitingTheDust.jpg",
                    players: [
                        { rank: 1, username: `Kvuthe`, time: "5:04.19" },
                        { rank: 2, username: `Fortunate`, time: "5:37.81" },
                        { rank: 3, username: `Dori`, time: "5:59.94" }
                    ]
                },
                {
                    id: 4,
                    title: "Biting The Dust4",
                    backgroundImage: "/src/assets/league_backgrounds/BitingTheDust.jpg",
                    players: [
                        { rank: 1, username: `Matt`, time: "8:45.12" },
                        { rank: 2, username: `Kylevuthe`, time: "9:12.33" },
                        { rank: 3, username: `Kvuthe`, time: "9:37.65" }
                    ]
                }
            ];

            setLeagueButtons(mockLeagueData);
        } finally {
            setLoadingButtons(false);
        }
    };

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            setError(null);

            try {
                const endpoint = `/leagues/su_25/week_${selectedWeek}/${selectedLevel}`;
                const response = await api.get(endpoint);

                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard data")
                }

                const data = await response.body.data;

                if (data && Array.isArray(data)) {

                    const rankedPlayers = data.map((player, index) => ({
                        rank: index + 1,
                        username: player.user,
                        time: player.time_complete,
                        video_url: player.video_url,
                        date: player.date,
                        flag: player.user_flag,
                        color: player.username_color
                    }));

                    setLeaderboardData(rankedPlayers);
                } else {
                    setLeaderboardData([]);
                }
            } catch (err) {
                console.error(err);
                const mockData = Array.from({ length: 15 }, (_, i) => ({
                    rank: i + 1,
                    username: `Matt_W${selectedWeek}`,
                    time: `${Math.floor(i / 2 + 1)}:${(Math.random() * 60).toFixed(2)}`
                }));
                setLeaderboardData(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [selectedWeek, selectedLevel]);

    const handleLeagueClick = (levelId) => {
        setSelectedLevel(levelId);
        setExpandedRun(null);
    };

    const handleWeekClick = (week) => {
        setSelectedWeek(week);
        setSelectedLevel(1);
        setExpandedRun(null);
    };

    const toggleRunExpansion = (runId) => {
        setExpandedRun(expandedRun === runId ? null : runId);
    };

    // Helper function to get level title
    const getLevelTitle = (levelId) => {
        const level = leagueButtons.find(l => l.id === levelId);
        return level ? level.title : `Level ${levelId}`;
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* League buttons card */}
                <Card className="flex-1 bg-fgPrimary border-none">
                    <CardHeader>
                        <CardTitle className="text-tBase font-poppins">Select IL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingButtons ? (
                            <div className="flex justify-center py-12">
                                <div className="text-tBase font-poppins">Loading button data...</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {leagueButtons.map((league) => (
                                    <button
                                        key={league.id}
                                        onClick={() => handleLeagueClick(league.id)}
                                        className={`relative w-full h-64 rounded-lg overflow-hidden text-tBase shadow-lg transition-transform hover:scale-105 ${
                                            selectedLevel === league.id ? 'ring-4 ring-colorActive' : ''
                                        }`}
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${league.backgroundImage})`,
                                            backgroundPosition: 'center',
                                            backgroundSize: 'cover'
                                        }}
                                    >
                                        <div className="absolute inset-0 flex flex-col p-2 pt-4">
                                            {/* Category badge */}
                                            <div className="absolute top-2 right-2 bg-colorActive text-tActive px-2 py-1 rounded text-xs font-poppins">
                                                {league.category}
                                            </div>

                                            {/* Leaderboard preview */}
                                            <div className="mb-auto mt-8">
                                                <div className="space-y-2">
                                                    {league.players.length > 0 ? (
                                                        league.players.map((player) => (
                                                            <div key={player.rank} className="flex justify-between text-sm">
                                                                <div className="flex gap-2">
                                                                    <span>{getRankDisplay(player.rank, 3, 3)}</span>
                                                                    <span className="font-poppins text-tDarkBg">{player.username}</span>
                                                                </div>
                                                                <span className="font-poppins text-tDarkBg">{player.time}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-tDarkBg py-4">
                                                            No times recorded yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Title at the bottom */}
                                            <div className="mt-auto pt-2 border-t border-gray-500">
                                                <h2 className="text-xl font-bold text-center">{league.title}</h2>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="pt-4 text-tBase font-poppins">
                            <p className="text-lg pb-4">
                                Welcome to the It Takes One League!
                            </p>
                            <p>
                                The It Takes One league is a 10 week event where players partake in an 8 week series competing in time trials across different sections of the It Takes Two Speedrun.
                                Once these 8 weeks are over, there will be a 1 week break where the players are seeded into a bracket competing for a prize in an ITO Race event.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Weeks buttons card */}
                <Card className="w-full md:w-64 bg-fgPrimary border-none">
                    <CardHeader>
                        <CardTitle className="text-tBase font-poppins">Select Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {weeks.map((week) => (
                                <button
                                    key={week}
                                    onClick={() => handleWeekClick(week)}
                                    className={`py-3 px-4 rounded transition-colors ${
                                        selectedWeek === week
                                            ? 'bg-colorActive hover:bg-colorActive text-tActive font-poppins'
                                            : 'bg-fgThird hover:bg-fgSecondary text-tBase font-poppins'
                                    }`}
                                >
                                    Week {week}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full leaderboard section below */}
            {selectedLevel && (
                <Card className="w-full bg-fgPrimary border-none">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-tBase font-poppins">
                            {getLevelTitle(selectedLevel)} - Week {selectedWeek} Leaderboard
                        </CardTitle>
                        {user && (
                            <Link
                                to="/leagues/submit"
                                className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                            >
                                Submit A Run
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="text-white">Loading leaderboard data...</div>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto">
                                {leaderboardData.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-fgSecondary">
                                            <TableRow className="hover:bg-fgSecondary">
                                                <TableHead className="text-tDarkBg font-poppins">Rank</TableHead>
                                                <TableHead className="text-tDarkBg font-poppins">Username</TableHead>
                                                <TableHead className="text-tDarkBg font-poppins text-right">Time</TableHead>
                                                <TableHead className="text-tDarkBg font-poppins text-right">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {leaderboardData.map((player, index) => (
                                                <React.Fragment key={index}>
                                                    <TableRow
                                                        key={index}
                                                        className={`border-b ${expandedRun === player.rank ? 'border-b-0 bg-fgSecondary text-tDarkBg' : 'border-b-bBase'} cursor-pointer hover:bg-fgSecondary transition-colors text-tBase hover:text-tDarkBg`}
                                                        onClick={() => toggleRunExpansion(player.rank)}
                                                    >
                                                        <TableCell>
                                                            <span>
                                                                {getRankDisplay(player.rank, 8, 8)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell
                                                            className={`font-poppins hover:underline text-tBase ${themeString}`}
                                                            style={{ color: player.color }}
                                                        >
                                                                        <span
                                                                            className={`fi fi-${player.flag.toLowerCase()} ml-4 mr-1`}
                                                                            title={player.flag}
                                                                            style={{fontSize: '1rem'}}
                                                                        />
                                                            <Link
                                                                to={`/profile/${player.username}`}
                                                            >
                                                                {player.username}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-right text-tBase font-poppins">{player.time}</TableCell>
                                                        <TableCell className="text-right text-tBase font-poppins">{getDaysAgo(player.date)}</TableCell>
                                                    </TableRow>

                                                    {expandedRun === player.rank && (
                                                        <>
                                                            {/* Video row */}
                                                            {player.video_url && (
                                                                <TableRow className="border-0 bg-fgSecondary hover:bg-fgSecondary">
                                                                    <TableCell colSpan={4} className="pl-4 pr-4 pt-2 pb-4">
                                                                        <div className="w-full aspect-video rounded-lg overflow-hidden">
                                                                            <iframe
                                                                                src={convertToEmbedUrl(player.video_url)}
                                                                                className="w-full h-full"
                                                                                allowFullScreen
                                                                                title={`Run by ${player.username}`}
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            ></iframe>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}

                                                            {/* Description row */}
                                                            <TableRow className="border-b-bBase border-b-2 bg-fgSecondary hover:bg-fgSecondary">
                                                                <TableCell colSpan={4} className="pl-4 pr-4 pt-2 pb-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <textarea
                                                                            className="w-full p-2 text-tBase border border-fgSecondary bg-fgThird hover:bg-fgThird rounded-lg resize-none focus:outline-none font-poppins"
                                                                            value={player.description ? `${player.description}` : ''}
                                                                            readOnly
                                                                            placeholder="No description available"
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-10 text-tBase font-poppins">
                                        No leaderboard data available for this level yet
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}