import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaInfoCircle } from 'react-icons/fa';
import { useApi } from "@/contexts/ApiProvider.jsx";
import {
    convertToEmbedUrl,
    formatCategory,
    formatChapter,
    formatSubChapter,
    getRankDisplay,
    navigateToLeaderboardWithRefresh
} from "../helpers.jsx"

const calculateTimeUntilRefresh = () => {
    const now = new Date();
    const refreshTime = new Date();

    refreshTime.setUTCHours(23 + 5, 59, 0, 0); // EST = UTC-5

    if (now > refreshTime) {
        refreshTime.setUTCDate(refreshTime.getUTCDate() + 1);
    }

    const timeDiff = refreshTime - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.ceil((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} hours and ${minutes} minutes`;
};


const HighlightCard = ({ themeString, showUsernameColor }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const api = useApi();

    const handleNavigateToLeaderboard = () => {
        if (highlights.length > 0) {
            navigateToLeaderboardWithRefresh(highlights[currentVideoIndex]);
        }
    };

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                setLoading(true);
                const endpoint = '/submission/highlights';
                const response = await api.get(endpoint);
                if (!response.ok) {
                    throw new Error('Failed to fetch highlights');
                }
                setHighlights(response.body.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchHighlights();
    }, []);

    const handlePrev = () => {
        if (!isAnimating && highlights.length > 0) {
            setDirection('left');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentVideoIndex((prevIndex) =>
                    prevIndex === 0 ? highlights.length - 1 : prevIndex - 1
                );
                setTimeout(() => setIsAnimating(false), 300);
            }, 300);
        }
    };

    const handleNext = () => {
        if (!isAnimating && highlights.length > 0) {
            setDirection('right');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentVideoIndex((prevIndex) =>
                    (prevIndex + 1) % highlights.length
                );
                setTimeout(() => setIsAnimating(false), 300);
            }, 300);
        }
    };

    if (loading) {
        return (
            <Tabs defaultValue="recent" className="relative">
                <div className="z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <p className="text-sm font-poppins text-tBase pl-3"> Daily Highlights</p>
                        <button
                            onClick={openModal}
                            className="ml-2 text-tBase hover:text-colorActive transition-colors pr-3"
                        >
                            <FaInfoCircle size={24}/>
                        </button>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                        <CardContent className="p-6 flex justify-center items-center h-64">
                            <p className="text-tBase">Loading highlights...</p>
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
                        <p className="text-sm font-poppins text-tBase pl-3"> Daily Highlights</p>
                        <button
                            onClick={openModal}
                            className="ml-2 text-tBase hover:text-colorActive transition-colors pr-3"
                        >
                            <FaInfoCircle size={24}/>
                        </button>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                        <CardContent className="p-6 flex justify-center items-center h-64">
                            <p className="text-tBase">Error loading highlights. Please try again later.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }

    if (highlights.length === 0) {
        return (
            <Tabs defaultValue="recent" className="relative">
                <div className="z-10">
                    <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                        <p className="text-sm font-poppins text-tBase pl-3"> Daily Highlights</p>
                        <button
                            onClick={openModal}
                            className="ml-2 text-tBase hover:text-colorActive transition-colors pr-3"
                        >
                            <FaInfoCircle size={24}/>
                        </button>
                    </TabsList>
                </div>

                <TabsContent value="recent" className="mt-0">
                    <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                        <CardContent className="p-6 flex justify-center items-center h-64">
                            <p className="text-tBase">No highlighted runs available at the moment.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }

    return (
        <Tabs defaultValue="recent" className="relative">
            <div className="z-10">
                <TabsList className="h-10 bg-fgPrimary rounded-b-none rounded-t-lg shadow-none">
                    <p className="text-sm font-poppins text-tBase pl-3"> Daily Highlights</p>
                    <button
                        onClick={openModal}
                        className="ml-2 text-tBase hover:text-colorActive transition-colors pr-3"
                    >
                        <FaInfoCircle size={24}/>
                    </button>
                </TabsList>
            </div>

            <TabsContent value="recent" className="mt-0">
                <Card className="w-full max-w-5xl bg-fgPrimary border-0 mb-10 rounded-none">
                    <CardContent className="p-2">
                        <div className="relative">
                            <button
                                onClick={handlePrev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-fgPrimary text-tBase rounded-full p-2 z-10 hover:bg-colorActive hover:text-tDarkBg transition-colors"
                                aria-label="Previous video"
                                disabled={isAnimating}
                            >
                                <ChevronLeft size={24}/>
                            </button>

                            <button
                                onClick={handleNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-fgPrimary text-tBase rounded-full p-2 z-10 hover:bg-colorActive hover:text-tDarkBg transition-colors"
                                aria-label="Next video"
                                disabled={isAnimating}
                            >
                                <ChevronRight size={24}/>
                            </button>

                            <div className="overflow-hidden rounded-none">
                                <div
                                    className={`transition-transform duration-600 ease-in-out ${
                                        isAnimating
                                            ? direction === 'right'
                                                ? 'translate-x-full opacity-0'
                                                : '-translate-x-full opacity-0'
                                            : 'translate-x-0 opacity-100'
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="aspect-video">
                                            <iframe
                                                className="w-full h-full rounded-none p-0 bg-fgThird"
                                                src={convertToEmbedUrl(highlights[currentVideoIndex]?.video_url)}
                                                title={highlights[currentVideoIndex]}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-4 bg-fgSecondary"></div>

                            <div className="bg-fgSecondary">
                                <div className="flex justify-center space-x-2">
                                    {highlights.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 w-2 rounded-full ${
                                                currentVideoIndex === index ? 'bg-tDarkBg' : 'bg-tBase opacity-50'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-4 bg-fgSecondary"></div>

                            <div className="flex justify-between items-center text-tBase bg-fgThird p-2">
                                <div className="flex-1">
                                    <button
                                        onClick={handleNavigateToLeaderboard}
                                        className="hover:underline text-sm font-poppins pb-2"
                                    >
                                        {formatCategory(highlights[currentVideoIndex].category)} - {formatChapter(highlights[currentVideoIndex].chapter)}
                                    </button>
                                    <div className="flex items-center">
                                        <Link
                                            to={`/profile/${highlights[currentVideoIndex].user}`}
                                            className={`
                                                        font-poppins
                                                        hover:underline\
                                                        text-sm
                                                        truncate max-w-[10ch]
                                                        ${themeString}
                                                        ${showUsernameColor ? "" : "text-tBase"}
                                                      `}
                                            style={showUsernameColor ? {color: highlights[currentVideoIndex].username_color} : {}}
                                        >
                                            {highlights[currentVideoIndex].user.length > 10
                                                ? `${highlights[currentVideoIndex].user.substring(0, 10)}...`
                                                : highlights[currentVideoIndex].user}
                                        </Link>
                                        <span
                                            className={`fi fi-${highlights[currentVideoIndex].user_flag.toLowerCase()} ml-4`}
                                            title={highlights[currentVideoIndex].user_flag}
                                            style={{fontSize: '.75rem', flexShrink: 0}}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex justify-center items-center text-right">
                                    {getRankDisplay(highlights[currentVideoIndex].rank, 10, 10)}
                                </div>

                                <div className="flex-1 flex flex-col items-end">
                                    <button
                                        onClick={handleNavigateToLeaderboard}
                                        className="hover:underline text-sm font-poppins pb-2"
                                    >
                                        {formatSubChapter(highlights[currentVideoIndex].sub_chapter)}
                                    </button>
                                    <p className="text-sm font-poppins">{highlights[currentVideoIndex].time_complete}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-bgPrimary p-6 rounded-lg shadow-lg max-w-md w-full">
                                <p className="text-tBase font-poppins">The next highlights will refresh in {calculateTimeUntilRefresh()}.</p>
                                <button
                                    onClick={closeModal}
                                    className="mt-4 bg-colorActive text-tDarkBg px-4 py-2 rounded-lg hover:bg-colorActiveDark transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default HighlightCard;