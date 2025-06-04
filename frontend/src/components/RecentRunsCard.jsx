import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiProvider';

import { convertToEmbedUrl,
    formatCategory,
    formatChapter,
    formatSubChapter,
    getRankDisplay,
    getDaysAgo,
    navigateToLeaderboardWithRefresh
} from "../helpers.jsx"
import {Link} from "react-router-dom";


const RunPopup = ({ run, onClose, color, showUsernameColor }) => {
    if (!run) return null;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleNavigateToLeaderboard = () => {
        navigateToLeaderboardWithRefresh(run, onClose);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div
                className="bg-bgPrimary rounded-lg w-96 md:w-full max-w-5xl md:h-[800px] h-[500px] flex flex-col relative z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute -top-4 -right-4 z-60">
                    <button
                        onClick={onClose}
                        className="text-tBase hover:text-gray-300 transition-colors bg-bgPrimary rounded-full p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="flex-1 bg-[#333333]">
                    {run.video_url ? (
                        <iframe
                            src={convertToEmbedUrl(run.video_url)}
                            className="w-full h-full"
                            allowFullScreen
                            title={`Run by ${run.user}`}
                        ></iframe>
                    ) : (
                        <div className="w-96 h-[70vh] flex items-center justify-center text-white">
                            No video URL available for this run
                        </div>
                    )}
                </div>

                <div className="p-8 bg-bgPrimary text-tBase">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex-1 flex flex-col gap-1">
                            <button
                                onClick={handleNavigateToLeaderboard}
                                className="md:text-sm text-sm font-poppins-medium hover:underline text-left"
                            >
                                {formatCategory(run.category)} - {formatChapter(run.chapter)}
                            </button>
                            <Link to={`/profile/${run.user}`} className={`
                                            text-sm 
                                            md:text-sm 
                                            font-poppins-medium
                                            hover:underline
                                            ${showUsernameColor ? "" : "text-tBase"}
                                          `}
                                  style={showUsernameColor ? { color: color } : {}}>{run.user}</Link>
                        </div>

                        <div className="flex-1 flex justify-center items-center">
                            {getRankDisplay(run.rank, 10, 10)}
                        </div>

                        <div className="flex-1 flex flex-col items-end">
                            <button
                                onClick={handleNavigateToLeaderboard}
                                className="md:text-sm text-sm font-poppins-medium hover:underline text-left"
                            >
                                {formatSubChapter(run.sub_chapter)}
                            </button>
                            <p className="text-sm md:text-sm font-poppins-medium">{run.time_complete}</p>
                        </div>
                    </div>
                    {run.description && (
                        <div className="mt-4">
                            <p className="text-sm md:text-base font-poppins text-tBase">
                                {run.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecentRunsCard = ({ themeString, showUsernameColor }) => {
    const api = useApi();
    const [recentRunData, setRecentRunData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRun, setSelectedRun] = useState(null);

    useEffect(() => {
        const fetchRecentRunsData = async () => {
            try {
                const endpoint = '/leaderboard/recent_runs';
                const response = await api.get(endpoint);

                if (response.ok) {
                    setRecentRunData(response.body.data);
                } else {
                    throw new Error(response.body?.message || "Failed to fetch recent runs");
                }
            } catch (error) {
                setError(error.message || "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecentRunsData();
    }, [api]);

    const handleRunClick = (run) => {
        setSelectedRun(run);
    };

    const closePopup = () => {
        setSelectedRun(null);
    };

    if (loading) {
        return (
            <Tabs defaultValue="recent" className="relative">
                <div className="z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <p className="text-sm font-poppins text-tBase pl-3 pr-3"> Recent Runs</p>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                        <CardContent className="p-6 flex justify-center items-center h-64">
                            <p className="text-tBase">Loading recent runs...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }

    if (error) {
        return (
            <Tabs defaultValue="recent" className="relative">
                <div className="z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <p className="text-sm font-poppins text-tBase pl-3 pr-3"> Recent Runs</p>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                        <CardContent className="p-6 flex justify-center items-center h-64">
                            <p className="text-tBase">Error loading recent runs. Please try again later.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <Tabs defaultValue="recent" className="relative">
                <div className="-top-10 z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <p className="text-sm font-poppins text-tBase pl-3 pr-3"> Recent Runs</p>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="border-0 bg-fgPrimary rounded-none overflow-hidden">
                        <CardContent className="p-2">
                            <div className="space-y-2">
                                {recentRunData?.slice(0, 3).map((run, index) => (
                                    <div
                                        key={run.id}
                                        className="border-0 rounded-none cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => handleRunClick(run)}
                                    >
                                        <div className="bg-fgSecondary p-3 text-tDarkBg">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium font-poppins-medium mr-4">{formatCategory(run.category)} - {formatChapter(run.chapter)}</h3>
                                                <p className="font-medium font-poppins-medium">{run.time_complete}</p>
                                            </div>
                                        </div>

                                        <div className="bg-fgThird p-3 text-tBase flex justify-between items-center">
                                            <p className="text-sm font-poppins-light">{formatSubChapter(run.sub_chapter)}</p>
                                            <div className="flex items-center pr-2">
                                                {getRankDisplay(run.rank)}
                                            </div>
                                        </div>

                                        <div className="bg-fgThird p-3 text-tBase flex justify-between items-center">
                                            <div className="flex items-center">
                                                <Link
                                                    to={`/profile/${run.user}`}
                                                    className={`
                                                                        font-poppins
                                                                        hover:underline
                                                                        ${themeString}
                                                                        ${showUsernameColor ? "" : "text-tBase"}
                                                                      `}
                                                    style={showUsernameColor ? { color: run.username_color } : {}}
                                                >
                                                    {run.user.length > 10
                                                        ? `${run.user.substring(0, 10)}...`
                                                        : run.user}
                                                </Link>
                                                <span
                                                    className={`fi fi-${run.user_flag.toLowerCase()} ml-4`}
                                                    title={run.user_flag}
                                                    style={{fontSize: '.75rem', flexShrink: 0}}
                                                />
                                            </div>
                                            <p className="text-sm font-poppins">{getDaysAgo(run.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedRun && <RunPopup run={selectedRun} color={selectedRun.username_color} showUsernameColor={showUsernameColor} onClose={closePopup}/>}
        </div>
    );
};

export default RecentRunsCard;