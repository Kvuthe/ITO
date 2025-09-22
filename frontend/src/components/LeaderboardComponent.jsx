import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiProvider';
import {
    convertToEmbedUrl,
    getRankDisplay,
    getDaysAgo
} from "../helpers.jsx";

const ReportSvg = ({ isReported }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        className={isReported ? "fill-red-800" : "fill-tDarkBg"}
    >
        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
    </svg>
);

const ReportModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="z-10 max-w-md w-full">{children}</div>
        </div>
    );
};

const LeaderboardComponent = ({ user, themeString, showUsernameColor = {} }) => {
    const api = useApi();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [gameData, setGameData] = useState(null);
    const [gameDataLoading, setGameDataLoading] = useState(true);

    const [view, setView] = useState(() => {
        const urlView = searchParams.get('view');
        return urlView === 'category' ? 'category_leaderboard' : 'main_leaderboard';
    });

    const [leaderboardData, setLeaderboardData] = useState(null);
    const [timeframe, setTimeframe] = useState(() => {
        return searchParams.get('timeframe') || "all_time";
    });
    const [category, setCategory] = useState(() => {
        return searchParams.get('category') || "any";
    });

    const [selectedGame, setSelectedGame] = useState(() => {
        return searchParams.get('game') || "itt";
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        return searchParams.get('runCategory') || "Any%";
    });
    const [selectedChapter, setSelectedChapter] = useState(() => {
        return searchParams.get('chapter') || "";
    });
    const [selectedSubChapter, setSelectedSubChapter] = useState(() => {
        return searchParams.get('subChapter') || "";
    });

    const [chapterLeaderboardData, setChapterLeaderboardData] = useState(null);
    const [expandedRun, setExpandedRun] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState("");
    const [reportedRun, setReportedRun] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGameData = async () => {
        setGameDataLoading(true);
        try {
            const response = await api.get('/game/data');
            if (response.ok) {
                setGameData(response.body.data);
            } else {
                console.error("Error fetching game data:", response.status);
                setError("Failed to fetch game data");
            }
        } catch (error) {
            console.error("Error fetching game data:", error);
            setError("Failed to fetch game data");
        } finally {
            setGameDataLoading(false);
        }
    };

    useEffect(() => {
        fetchGameData();
    }, [])

    const updateUrlParams = (newParams) => {
        const currentParams = new URLSearchParams(location.search);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                currentParams.set(key, value);
            } else {
                currentParams.delete(key);
            }
        });

        navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
    };

    const fetchUserLeaderboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = `/leaderboard/users/${category}/${timeframe}`;
            const response = await api.get(endpoint);

            if (response.ok) {
                setLeaderboardData(response.body.data);
            } else {
                console.error("Error fetching user leaderboard:", response.status);
                setError("Failed to fetch leaderboard data");
            }
        } catch (error) {
            setError(error.message || "An error occurred while fetching leaderboard data.");
            console.error("Error in user leaderboard fetch:", error);
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
            if (rankedData[i].timeframe_score === rankedData[i-1].timeframe_score) {
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

    const getCategories = () => {
        return Object.keys(gameData?.[selectedGame]?.categories ?? {});
    };

    const getChapters = () => {
        return Object.keys(gameData?.[selectedGame]?.categories?.[selectedCategory] ?? {});
    };

    const getSubChapters = () => {
        return Object.keys(gameData?.[selectedGame]?.categories?.[selectedCategory]?.[selectedChapter] ?? {});
    };

    const getSubChapterDetails = () => {
        return gameData?.[selectedGame]?.categories?.[selectedCategory]?.[selectedChapter]?.[selectedSubChapter] ?? null;
    };

    const fetchChapterLeaderboardData = async () => {
        if (!selectedGame || !selectedCategory || !selectedChapter || !selectedSubChapter) return;

        setLoading(true);
        setError(null);

        try {
            const endpoint = `/leaderboard/${selectedGame.toLowerCase()}/${selectedCategory.toLowerCase().replaceAll(" ", "_").replaceAll("%", "")}/${selectedChapter.toLowerCase()}/${selectedSubChapter.toLowerCase().replaceAll(" ","_")}`;
            const response = await api.get(endpoint);

            if (response.ok) {
                setChapterLeaderboardData(response.body.data);
            } else {
                setError("An error occurred while fetching data.");
            }
        } catch (error) {
            setError(error.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = (newView) => {
        const viewParam = newView === "category_leaderboard" ? "category" : "main";
        setView(newView);

        updateUrlParams({ view: viewParam });

        if (newView === "main_leaderboard") {
            setError(null);
        } else {
            if (newView === "category_leaderboard") {
                setSelectedCategory("Any%");
            }
            setError(null);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);

        setChapterLeaderboardData(null);
        setExpandedRun(null);

        if (!isInitialLoad) {
            const chapters = getChaptersForCategory(category);
            const firstChapter = chapters.length > 0 ? chapters[0] : "";
            setSelectedChapter(firstChapter);

            if (firstChapter) {
                const subChapters = getSubChaptersForChapter(category, firstChapter);
                const firstSubChapter = subChapters.length > 0 ? subChapters[0] : "";
                setSelectedSubChapter(firstSubChapter);

                updateUrlParams({
                    runCategory: category,
                    chapter: firstChapter,
                    subChapter: firstSubChapter
                });
            } else {
                setSelectedSubChapter("");
                updateUrlParams({
                    runCategory: category,
                    chapter: "",
                    subChapter: ""
                });
            }
        } else {
            updateUrlParams({ runCategory: category });
        }
    };

    const handleChapterChange = (chapter) => {
        console.log("CALLED CHANGE CHAPTER");
        setSelectedChapter(chapter);
        setChapterLeaderboardData(null);
        setExpandedRun(null);

        if (!isInitialLoad) {
            const subChapters = getSubChapters();
            const firstSubChapter = subChapters.length > 0 ? subChapters[0] : "";
            setSelectedSubChapter(firstSubChapter);
            console.log("HIT", selectedSubChapter);

            updateUrlParams({
                chapter: chapter,
                subChapter: firstSubChapter
            });
        } else {
            updateUrlParams({ chapter: chapter });
        }
    };

    const handleSubChapterChange = (subChapter) => {
        setSelectedSubChapter(subChapter);
        console.log(subChapter);
        setExpandedRun(null);

        updateUrlParams({ subChapter: subChapter });
    };

    const getChaptersForCategory = (categoryName) => {
        console.log("DATA", gameData);
        return Object.keys(gameData?.[selectedGame]?.categories?.[categoryName] ?? {});
    };

    const getSubChaptersForChapter = (categoryName, chapterName) => {
        return Object.keys(gameData?.[selectedGame]?.categories?.[categoryName]?.[chapterName] ?? {});
    };

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
        updateUrlParams({ timeframe: newTimeframe });
    };

    const handleUserCategoryChange = (newCategory) => {
        setCategory(newCategory);
        updateUrlParams({ category: newCategory });
    };

    const toggleRunExpansion = (runId) => {
        setExpandedRun(expandedRun === runId ? null : runId);
    };

    const openReportModal = (run) => {
        setReportedRun(run);
        setReportMessage("");
        setIsReportModalOpen(true);
    };

    const closeReportModal = () => {
        setIsReportModalOpen(false);
        setReportedRun(null);
        setReportMessage("");
    };

    const handleReportSubmit = async () => {
        if (!reportedRun || !reportMessage.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await api.post('/submission/report', {
                run_id: reportedRun.id,
                message: reportMessage
            });

            if (response.ok) {
                closeReportModal();
                await fetchChapterLeaderboardData();
            } else {
                setError("Failed to submit report. Please try again.");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred while submitting the report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (view === "category_leaderboard" && isInitialLoad) {
            const urlChapter = searchParams.get('chapter');
            const urlSubChapter = searchParams.get('subChapter');

            if (!urlChapter && !urlSubChapter) {
                const chapters = getChapters();
                if (chapters.length > 0 && !selectedChapter) {
                    const firstChapter = chapters[0];
                    setSelectedChapter(firstChapter);

                    const subChapters = getSubChaptersForChapter(selectedCategory, firstChapter);
                    if (subChapters.length > 0) {
                        setSelectedSubChapter(subChapters[0]);
                        updateUrlParams({
                            chapter: firstChapter,
                            subChapter: subChapters[0]
                        });
                    }
                }
            }
        }

        setIsInitialLoad(false);
    }, [view, selectedGame, selectedCategory]);

    useEffect(() => {
        if (view === "main_leaderboard") {
            fetchUserLeaderboardData();
        }
    }, [view, timeframe, category]);

    useEffect(() => {
        if (view !== "main_leaderboard" && selectedSubChapter) {
            fetchChapterLeaderboardData();
        }
    }, [view, selectedSubChapter]);

    useEffect(() => {
        if (!isInitialLoad) {
            const chapters = getChapters();
            if (chapters.length > 0 && !selectedChapter) {
                const firstChapter = chapters[0];
                setSelectedChapter(firstChapter);

                const subChapters = getSubChaptersForChapter(selectedCategory, firstChapter);
                if (subChapters.length > 0) {
                    setSelectedSubChapter(subChapters[0]);
                }
            }
        }
    }, [selectedCategory, isInitialLoad]);

    useEffect(() => {
        if (!isInitialLoad && selectedChapter) {
            const subChapters = getSubChapters();
            if (subChapters.length > 0 && !selectedSubChapter) {
                setSelectedSubChapter(subChapters[0]);
            }
        }
    }, [selectedChapter, isInitialLoad]);

    if (gameDataLoading) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <div className="text-center py-8 text-tBase font-poppins">
                    Loading game data...
                </div>
            </div>
        );
    }

    if (!gameData || !gameData[selectedGame]) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <div className="text-center py-8 text-tBase font-poppins">
                    No game data available for "{selectedGame}"
                    <br/>
                    <small>Available games: {gameData ? Object.keys(gameData).join(', ') : 'None'}</small>
                </div>
            </div>
        );
    }

        const subChapterDetails = getSubChapterDetails();

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Main View Tabs */}
            <Tabs value={view} onValueChange={handleViewChange} className="w-full mb-4">
                <TabsList className="w-full h-10 bg-fgPrimary rounded-lg shadow-none">
                    <TabsTrigger value="main_leaderboard" className="flex-1 text-tBase font-poppins data-[state=active]:bg-colorActive data-[state=active]:text-tActive">
                        Global Leaderboards
                    </TabsTrigger>
                    <TabsTrigger value="category_leaderboard" className="flex-1 text-tBase font-poppins data-[state=active]:bg-colorActive data-[state=active]:text-tActive">
                        Category Leaderboards
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* User Leaderboard View */}
            {view === "main_leaderboard" && (
                <div className="w-full mx-auto">
                    <Tabs value={category} onValueChange={handleUserCategoryChange} className="relative">
                        <div className="z-10 shadow-none">
                            <TabsList
                                className="h-10 bg-transparent rounded-b-none rounded-t-lg shadow-none p-0 inline-flex">
                                <TabsTrigger
                                    value="any"
                                    className="text-tDarkBg px-4 py-2.5 bg-fgSecondary data-[state=active]:bg-fgPrimary data-[state=active]:text-tBase rounded-b-none rounded-t-lg font-poppins whitespace-nowrap flex-shrink-0"
                                >
                                    Any%
                                </TabsTrigger>
                                <TabsTrigger
                                    value="in_bounds"
                                    className="text-tDarkBg px-4 py-2.5 bg-fgSecondary data-[state=active]:bg-fgPrimary data-[state=active]:text-tBase rounded-b-none rounded-t-lg font-poppins whitespace-nowrap flex-shrink-0"
                                >
                                    Inbounds
                                </TabsTrigger>
                                <TabsTrigger
                                    value="main_board"
                                    className="text-tDarkBg px-4 py-2.5 bg-fgSecondary data-[state=active]:bg-fgPrimary data-[state=active]:text-tBase rounded-b-none rounded-t-lg font-poppins whitespace-nowrap flex-shrink-0"
                                >
                                    Total Board
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value={category} className="mt-0">
                            <Card className="border-0 bg-fgPrimary rounded-none overflow-hidden z-12">
                                <CardContent className="p-8">
                                    {/* Timeframe buttons */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <Button
                                            variant={timeframe === "all_time" ? "default" : "outline"}
                                            onClick={() => handleTimeframeChange("all_time")}
                                            className={`font-poppins border-0 ${timeframe === "all_time" ? 'bg-colorActive text-tActive' : 'bg-bgPrimary text-tBase'}`}
                                        >
                                            All Time
                                        </Button>
                                        <Button
                                            variant={timeframe === "monthly" ? "default" : "outline"}
                                            onClick={() => handleTimeframeChange("monthly")}
                                            className={`font-poppins border-0 ${timeframe === "monthly" ? 'bg-colorActive text-tActive' : 'bg-bgPrimary text-tBase'}`}
                                        >
                                            Monthly
                                        </Button>
                                        <Button
                                            variant={timeframe === "weekly" ? "default" : "outline"}
                                            onClick={() => handleTimeframeChange("weekly")}
                                            className={`font-poppins border-0 ${timeframe === "weekly" ? 'bg-colorActive text-tActive' : 'bg-bgPrimary text-tBase'}`}
                                        >
                                            Weekly
                                        </Button>
                                    </div>

                                    <div className="border-b mb-4 border-b-bBase"></div>

                                    {/* Leaderboard display */}
                                    <div className="mt-4 space-y-4">
                                        {loading ? (
                                            <div className="text-center py-6 text-tBase">Loading leaderboard
                                                data...</div>
                                        ) : error ? (
                                            <div className="text-center py-6 text-tBase">Error loading
                                                data: {error}</div>
                                        ) : leaderboardData && leaderboardData.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-fgSecondary">
                                                        <TableRow className="hover:bg-fgSecondary">
                                                            <TableHead
                                                                className="w-16 text-tDarkBg font-poppins">Rank</TableHead>
                                                            <TableHead
                                                                className="text-tDarkBg font-poppins">Username</TableHead>
                                                            <TableHead
                                                                className="text-tDarkBg text-right font-poppins">Points</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="bg-fgThird">
                                                        {calculateRanks(leaderboardData).map((user) => (
                                                            <TableRow key={user.id}
                                                                      className="border-b-bBase hover:bg-fgSecondary">
                                                                <TableCell className="text-center">
                                                                    {getRankDisplay(user.rank, 8, 8)}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`
                                                                        font-poppins
                                                                        hover:underline
                                                                        ${themeString}
                                                                        ${showUsernameColor && user.username_color ? "" : "text-tBase"}
                                                                    `}
                                                                    style={(showUsernameColor && user.username_color) ? {color: user.username_color} : {}}
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
                                                                <TableCell
                                                                    className="text-right pr-3 font-poppins text-tBase">
                                                                    {user.timeframe_score}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-tBase">
                                                No leaderboard data available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {/* Chapter Leaderboard View */}
            {view !== "main_leaderboard" && (
                <div className="w-full mx-auto">
                    <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="relative">
                    <div className="z-10 shadow-none">
                            <TabsList className="h-10 bg-transparent rounded-b-none rounded-t-lg shadow-none p-0 inline-flex">
                                {getCategories().map(category => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="text-tDarkBg px-4 py-2.5 bg-fgSecondary data-[state=active]:bg-fgPrimary data-[state=active]:text-tBase rounded-b-none rounded-t-lg font-poppins whitespace-nowrap flex-shrink-0"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <TabsContent value={selectedCategory} className="mt-0">
                            <Card className="border-0 bg-fgPrimary rounded-none overflow-hidden z-12">
                                <CardContent className="p-8">
                                    {/* Chapter buttons */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {getChapters().map(chapter => (
                                            <Button
                                                key={chapter}
                                                variant={selectedChapter === chapter ? "default" : "outline"}
                                                onClick={() => handleChapterChange(chapter)}
                                                className={`font-poppins border-0 ${selectedChapter === chapter ? 'bg-colorActive text-tActive' : 'bg-bgPrimary text-tBase'}`}
                                            >
                                                {chapter}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="border-b mb-4 border-b-bBase"></div>

                                    {selectedChapter && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {getSubChapters().map(subChapter => (
                                                <Button
                                                    key={subChapter}
                                                    variant={selectedSubChapter === subChapter ? "default" : "outline"}
                                                    onClick={() => handleSubChapterChange(subChapter)}
                                                    className={`font-poppins border-0 ${selectedSubChapter === subChapter ? 'bg-colorActive text-tActive' : 'bg-bgPrimary text-tBase'}`}
                                                >
                                                    {subChapter}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Leaderboard display */}
                                    {!selectedSubChapter ? (
                                        <div className="text-center py-6 text-tBase">Please select a sub chapter</div>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            {subChapterDetails && (
                                                <div className="bg-fgThird rounded-lg p-4">

                                                    <div className="space-y-2 text-sm">
                                                        <p className="text-tBase font-poppins">
                                                            <span>Timing Start:</span> <i>{subChapterDetails["Timing Start"]}</i>
                                                        </p>
                                                        <p className="text-tBase font-poppins">
                                                            <span>Timing End:</span> <i>{subChapterDetails["Timing End"]}</i>
                                                        </p>
                                                        {subChapterDetails["Extra Info"] && (
                                                            <p className="text-tBase font-poppins">
                                                                <span className="font-poppins">Notes:</span> {subChapterDetails["Extra Info"]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {loading ? (
                                                <div className="text-center font-poppins text-tBase">Loading leaderboard data...</div>
                                            ) : error ? (
                                                <div className="text-center py-6 font-poppins text-tBase border-b-red-500">Error loading data: {error}</div>
                                            ) : chapterLeaderboardData ? (
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableBody className="bg-fgThird">
                                                            {chapterLeaderboardData.map((run) => (
                                                                <React.Fragment key={run.rank}>
                                                                    <TableRow
                                                                        className={`border-b ${expandedRun === run.rank ? 'border-b-0 bg-fgSecondary text-tDarkBg' : 'border-b-bBase'} cursor-pointer hover:bg-fgSecondary transition-colors text-tBase hover:text-tDarkBg`}
                                                                        onClick={() => toggleRunExpansion(run.rank)}
                                                                    >
                                                                        <TableCell className="pl-4 text-left font-poppins">{getRankDisplay(run.rank)}</TableCell>
                                                                        <TableCell
                                                                            className={`
                                                                                font-poppins
                                                                                hover:underline
                                                                                ${themeString}
                                                                                ${showUsernameColor ? "" : "text-tBase"}
                                                                            `}
                                                                            style={showUsernameColor ? { color: run.username_color } : {}}
                                                                        >
                                                                            <span
                                                                                className={`fi fi-${run.user_flag.toLowerCase()} ml-4 mr-1`}
                                                                                title={run.user_flag}
                                                                                style={{ fontSize: '1rem' }}
                                                                            />
                                                                            <Link
                                                                                to={`/profile/${run.user}`}
                                                                            >
                                                                                {run.user}
                                                                            </Link>
                                                                        </TableCell>
                                                                        <TableCell
                                                                            className="text-left font-poppins">{run.time_complete}</TableCell>
                                                                        <TableCell
                                                                            className="pr-4 text-left font-poppins">{getDaysAgo(run.date)}</TableCell>
                                                                    </TableRow>

                                                                    {expandedRun === run.rank && (
                                                                        <>
                                                                            {/* Video row */}
                                                                            {run.video_url && (
                                                                                <TableRow className="border-0 bg-fgSecondary hover:bg-fgSecondary">
                                                                                    <TableCell colSpan={5} className="pl-4 pr-4 pt-2 pb-4">
                                                                                        <div className="w-full aspect-video rounded-lg overflow-hidden">
                                                                                            <iframe
                                                                                                src={convertToEmbedUrl(run.video_url)}
                                                                                                className="w-full h-full"
                                                                                                allowFullScreen
                                                                                                title={`Run by ${run.user}`}
                                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                            ></iframe>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )}

                                                                            {/* Description row */}
                                                                            <TableRow className="border-b-bBase border-b-2 bg-fgSecondary hover:bg-fgSecondary">
                                                                                <TableCell colSpan={5} className="pl-4 pr-4 pt-2 pb-4">
                                                                                    <div className="flex items-center space-x-2">
                                                    <textarea
                                                        className="w-full p-2 text-tBase border border-fgSecondary bg-fgThird hover:bg-fgThird rounded-lg resize-none focus:outline-none font-poppins"
                                                        value={run.description ? `${run.description}` : ''}
                                                        readOnly
                                                        placeholder="No description available"
                                                    />
                                                                                        {user?.role >= 1 && (
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openReportModal(run);
                                                                                                }}
                                                                                                className="p-1 rounded hover:bg-opacity-20"
                                                                                            >
                                                                                                <ReportSvg isReported={run.reported} />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-tBase font-poppins">Select a sub-chapter to view leaderboard data</div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {/* Report Modal */}
            <ReportModal isOpen={isReportModalOpen} onClose={closeReportModal}>
                <Card className="bg-fgPrimary border-0 shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-poppins text-tBase mb-4">
                            {reportedRun?.reported
                                ? `Run by ${reportedRun?.user} has already been reported`
                                : `Report Run by ${reportedRun?.user}`}
                        </h3>

                        {!reportedRun?.reported ? (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="reportMessage" className="block mb-2 text-sm font-poppins text-tBase">
                                        Reason for reporting
                                    </label>
                                    <Textarea
                                        id="reportMessage"
                                        value={reportMessage}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setReportMessage(e.target.value)
                                            }
                                        }}
                                        className="w-full bg-fgThird border-bBase text-tBase font-poppins p-2 rounded-md"
                                        placeholder="Please provide details about why you're reporting this run..."
                                        rows={4}
                                        maxLength={255}
                                    />
                                    <p className="text-xs text-tBase mt-1">
                                        {reportMessage.length}/255 characters
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={closeReportModal}
                                        className="bg-bgPrimary text-tBase border-0 font-poppins hover:bg-colorActive hover:text-tActive"
                                        disabled={isSubmitting}
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        onClick={handleReportSubmit}
                                        className="bg-bgPrimary text-tBase border-0 font-poppins hover:bg-colorActive hover:text-tActive"
                                        disabled={isSubmitting || !reportMessage.trim()}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Report"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="mb-4 text-tBase font-poppins">
                                <p>This run has already been reported and is awaiting review by moderators. Contact a mod if you would like to add to the report.</p>
                                <div className="flex justify-end mt-4">
                                    <Button
                                        onClick={closeReportModal}
                                        className="bg-bgPrimary text-tBase border-0 font-poppins hover:bg-colorActive hover:text-tActive"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ReportModal>
        </div>
    );
};

export default LeaderboardComponent;