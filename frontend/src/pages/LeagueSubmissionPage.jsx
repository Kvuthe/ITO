import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApi } from '@/contexts/ApiProvider.jsx';
import { useUser } from '@/contexts/UserProvider.jsx';
import { useParams, useNavigate } from "react-router-dom";

const LeagueSubmissionPage = () => {
    const api = useApi();
    const { seasonId } = useParams();
    const navigate = useNavigate();
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [leagueData, setLeagueData] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [availableLevels, setAvailableLevels] = useState([]);

    const cardRef = useRef(null);

    const [formData, setFormData] = useState({
        week: '',
        level: '',
        video_url: '',
        minutes: '',
        seconds: '',
        milliseconds: ''
    });

    // Fetch league data on component mount
    useEffect(() => {
        const fetchLeagueData = async () => {
            try {
                const response = await api.get(`/leagues/buttons/${seasonId}`);
                if (response.ok) {
                    const data = response.body.data;
                    setLeagueData(data);

                    const runningWeek = Object.keys(data).find(key =>
                        key.startsWith('week_') && data[key].currently_running
                    );

                    if (runningWeek) {
                        const weekNumber = runningWeek.replace('week_', '');
                        setCurrentWeek(weekNumber);

                        const levels = Object.keys(data[runningWeek].levels).map(levelKey => ({
                            value: levelKey,
                            name: data[runningWeek].levels[levelKey].name,
                            category: data[runningWeek].levels[levelKey].category
                        }));
                        setAvailableLevels(levels);

                        setFormData(prev => ({
                            ...prev,
                            week: weekNumber
                        }));
                    }
                } else {
                    throw new Error('Failed to fetch league data');
                }
            } catch (err) {
                console.error('Error fetching league data:', err);
                setError('Failed to load league data');
            }
        };

        fetchLeagueData();
    }, [api]);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        const minutes = formData.minutes === '' ? 0 : parseInt(formData.minutes);
        const seconds = formData.seconds === '' ? 0 : parseInt(formData.seconds);
        const milliseconds = formData.milliseconds === '' ? 0 : parseInt(formData.milliseconds);

        const timeComplete = `${minutes}:${seconds}:${milliseconds}`;

        try {
            const response = await api.post('/league/submission/create', {
                week: parseInt(formData.week),
                level: formData.level,
                video_url: formData.video_url,
                time_complete: timeComplete,
                season: seasonId,
                minutes,
                seconds,
                milliseconds
            });

            if (response.ok) {
                setSuccess(true);
                setFormData({
                    week: currentWeek, // Keep the current week selected
                    level: '',
                    video_url: '',
                    minutes: '',
                    seconds: '',
                    milliseconds: ''
                });
            } else {
                if (response.status == 401){
                    throw new Error("Please login before submitting")
                } else {
                    throw new Error('Failed to create league submission');
                }
            }
        } catch (err) {
            console.log(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if ((success || error) && cardRef.current) {
            cardRef.current.scrollTo({
                top: cardRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [success, error]);

    // Show loading state while fetching league data
    if (!leagueData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
                <Card className="w-full max-w-xl h-[700px] bg-fgPrimary border-0 mt-24">
                    <CardContent className="flex items-center justify-center h-full">
                        <div className="text-tBase font-poppins">Loading league data...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show message if no current week is running
    if (!currentWeek) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
                <Card className="w-full max-w-xl h-[700px] bg-fgPrimary border-0 mt-24">
                    <CardHeader>
                        <div className="relative">
                            <button
                                onClick={() => navigate(`/leagues/${seasonId}`)}
                                className="absolute left-0 top-0 p-2 bg-bgPrimary text-tBase hover:bg-colorActive rounded-full transition-colors"
                                aria-label="Back to leagues"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-tBase"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <CardTitle className="text-2xl text-center text-tBase font-poppins">Submit League Entry</CardTitle>
                        </div>
                        <div className="text-center text-sm text-tBase font-poppins opacity-75">
                            Week {currentWeek}
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <div className="text-center text-tBase font-poppins">
                            No league week is currently running. Please check back later.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
            <Card className="w-full max-w-xl h-[700px] overflow-auto bg-fgPrimary border-0 mt-24" ref={cardRef}>
                <CardHeader>
                    <div className="relative">
                        <button
                            onClick={() => navigate(`/leagues/${seasonId}`)}
                            className="absolute left-0 top-0 p-2 bg-bgPrimary text-tBase hover:bg-colorActive rounded-full transition-colors"
                            aria-label="Back to leagues"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-tBase"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <CardTitle className="text-2xl text-center text-tBase font-poppins">Submit League Entry</CardTitle>
                    </div>
                    <div className="text-center text-sm text-tBase font-poppins opacity-75">
                        Week {currentWeek}
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <>
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative">
                                {error}
                            </div>
                            <div className="pb-4"></div>
                        </>
                    )}

                    {success && (
                        <>
                            <div className="bg-fgThird border border-green-400 text-tBase px-4 py-3 rounded relative">
                                League submission created successfully!
                            </div>
                            <div className="pb-4"></div>
                        </>
                    )}

                    <div className="space-y-6">
                        {/* Week Selection - Now read-only showing current week */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Week</label>
                            <div className="bg-fgThird border-0 text-tBase font-poppins px-3 py-2 rounded-md">
                                Week {currentWeek}
                            </div>
                        </div>

                        {/* Level Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Level</label>
                            <Select
                                value={formData.level}
                                onValueChange={(value) => handleChange('level', value)}
                            >
                                <SelectTrigger className="bg-fgThird border-0 text-tBase font-poppins">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent
                                    className="text-sm bg-fgThird text-tBase border-0 font-poppins dropdown-content"
                                    position="popper"
                                    sideOffset={5}
                                    align="start"
                                    avoidCollisions={false}
                                >
                                    {availableLevels.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                           {level.name} ({level.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Video URL */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Video URL</label>
                            <Input
                                type="url"
                                value={formData.video_url}
                                onChange={(e) => handleChange('video_url', e.target.value)}
                                placeholder="Enter video URL"
                                className="w-full text-tBase font-poppins bg-fgThird border-0"
                                required
                            />
                        </div>

                        {/* Time Complete */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Time Complete</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={formData.minutes}
                                    onChange={(e) => handleChange('minutes', e.target.value)}
                                    placeholder="MM"
                                    className="w-1/3 text-tBase font-poppins bg-fgThird border-0"
                                    min="0"
                                />
                                <Input
                                    type="number"
                                    value={formData.seconds}
                                    onChange={(e) => handleChange('seconds', e.target.value)}
                                    placeholder="SS"
                                    className="w-1/3 text-tBase font-poppins bg-fgThird border-0"
                                    min="0"
                                    max="59"
                                />
                                <Input
                                    type="number"
                                    value={formData.milliseconds}
                                    onChange={(e) => handleChange('milliseconds', e.target.value)}
                                    placeholder="ms"
                                    className="w-1/3 text-tBase font-poppins bg-fgThird border-0"
                                    min="0"
                                    max="999"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg"
                            disabled={loading || !formData.level || !formData.video_url}
                        >
                            {loading ? 'Submitting...' : 'Submit League Entry'}
                        </Button>
                    </div>

                    <div className="mt-4">
                        <p className="text-tBase font-poppins text-xs text-left">
                            Make sure your submission is valid with the{' '}
                        <a
                            href="/#league-rules"
                            className="text-colorActive hover:underline"
                        >
                            rules
                            </a>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeagueSubmissionPage;