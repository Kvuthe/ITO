import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import gameData from '../GameData.json';
import {useApi} from "@/contexts/ApiProvider.jsx";
import { useUser } from "@/contexts/UserProvider.jsx";
import {Link, useNavigate} from 'react-router-dom';
import UserSettingsModal from "../components/UserSettingsModal.jsx";
import 'flag-icons/css/flag-icons.min.css'
import {
    convertToEmbedUrl,
    formatCategory,
    formatChapter,
    formatSubChapter,
    getRankDisplay,
    getDaysAgo,
    convertUnixToDateInput, navigateToLeaderboardWithRefresh
} from "../helpers.jsx"

const EditRunModal = ({ run, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        video_url: run?.video_url || '',
        minutes: '',
        seconds: '',
        milliseconds: '',
        description: run?.description || '',
        date: run?.date || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (run) {
            const updates = {
                video_url: run.video_url || '',
                description: run.description || '',
                date: run.date ? convertUnixToDateInput(run.date) : '',
                minutes: '',
                seconds: '',
                milliseconds: '',
            };

            if (run.time_complete) {
                const timeMatch = run.time_complete.match(/^(\d+):(\d+)\.(\d+)$/);
                if (timeMatch) {
                    updates.minutes = timeMatch[1];
                    updates.seconds = timeMatch[2];
                    updates.milliseconds = timeMatch[3];
                }
            }

            setFormData(updates);
        }

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [run]);

    const handleChange = (name, value) => {
        setError('');
        setSuccess(false);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        const mins = formData.minutes.trim()
        if (!mins) {
            formData.minutes = "0";
        }

        try {
            const timeComplete = `${formData.minutes}:${formData.seconds}.${formData.milliseconds}`;

            let dateToSend;
            if (formData.date && formData.date !== convertUnixToDateInput(run.date)) {
                dateToSend = formData.date;
            } else {
                dateToSend = run.date;
            }

            await onSave({
                id: run.id,
                time_complete: timeComplete,
                video_url: formData.video_url,
                description: formData.description,
                date: dateToSend
            });

            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to update run');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div
                className="bg-fgPrimary rounded-lg w-full max-w-md flex flex-col relative z-10 max-h-[600px] overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-2 right-2 z-60">
                    <button
                        onClick={onClose}
                        className="text-tBase hover:text-colorActive transition-colors rounded-full p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="p-6 pt-10">
                    <h2 className="text-2xl text-center text-tBase font-poppins mb-6">Edit Run</h2>

                    {error && (
                        <>
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative">
                                Failed to edit the run correctly. Please try again later.
                            </div>
                            <div className="pb-4"></div>
                        </>
                    )}

                    {success && (
                        <>
                            <div className="bg-fgThird border border-green-400 text-tBase px-4 py-3 rounded relative">
                                Run updated successfully! The page will now reload.
                            </div>
                            <div className="pb-4"></div>
                        </>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Date</label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="w-full text-tBase font-poppins bg-fgThird border-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Video URL</label>
                            <Input
                                type="url"
                                value={formData.video_url}
                                onChange={(e) => handleChange('video_url', e.target.value)}
                                placeholder="Enter video URL"
                                className="w-full text-tBase font-poppins bg-fgThird border-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Time Complete</label>
                            <div className="flex gap-2">
                                <div className="w-1/3">
                                    <Input
                                        type="number"
                                        value={formData.minutes}
                                        onChange={(e) => handleChange('minutes', e.target.value)}
                                        placeholder="MM"
                                        className="w-full text-tBase font-poppins bg-fgThird border-0"
                                        min="0"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <Input
                                        type="number"
                                        value={formData.seconds}
                                        onChange={(e) => handleChange('seconds', e.target.value)}
                                        placeholder="SS"
                                        className="w-full text-tBase font-poppins bg-fgThird border-0"
                                        min="0"
                                        max="59"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <Input
                                        type="number"
                                        value={formData.milliseconds}
                                        onChange={(e) => handleChange('milliseconds', e.target.value)}
                                        placeholder="ms"
                                        className="w-full text-tBase font-poppins bg-fgThird border-0"
                                        min="0"
                                        max="99"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Description</label>
                            <Input
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Enter a description for your run"
                                className="w-full text-tBase font-poppins bg-fgThird border-0"
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                onClick={onClose}
                                className="w-1/2 bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-1/2 bg-colorActive text-tActive hover:bg-fgSecondary hover:text-tDarkBg font-poppins"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RunPopup = ({ run, onClose, username, color, showUsernameColor }) => {
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
                        className="text-white hover:text-gray-300 transition-colors bg-bgPrimary rounded-full p-2"
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
                            title={`Run by ${username}`}
                        ></iframe>
                    ) : (
                        <div className="w-96 h-[70vh] flex items-center justify-center text-white">
                            No video URL available for this run
                        </div>
                    )}
                </div>

                <div className="p-8 bg-bgPrimary text-tBase">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                            <button
                                onClick={handleNavigateToLeaderboard}
                                className="md:text-sm text-sm font-poppins-medium hover:underline text-left"
                            >
                                {formatCategory(run.category)} - {formatChapter(run.chapter)}
                            </button>
                            <p className={`
                                            text-sm 
                                            md:text-sm 
                                            font-poppins-medium
                                            ${showUsernameColor ? "" : "text-tBase"}
                                          `}
                               style={showUsernameColor ? {color: color} : {}}>{username}</p>
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
                            <p className="text-sm md:text-base font-poppins text-gray-300">
                                {run.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileGrid = ({ username, showUsernameColor }) => {
    const [selectedCategory, setSelectedCategory] = useState('Any%');
    const [profileData, setProfileData] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRun, setSelectedRun] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingRun, setEditingRun] = useState(null);
    const api = useApi();
    const user = useUser();
    const navigate = useNavigate();
    const isOwnProfile = user?.user?.username === username;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const endpoint = `/profile/${username}`;
                const response = await api.get(endpoint);

                if (!response.ok){
                    throw new Error('Failed to fetch profile data.');
                }
                setProfileData(response.body.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username, user.user]);

    useEffect(() => {
        if (selectedCategory && gameData.itt.categories[selectedCategory]) {
            setChapters(Object.keys(gameData.itt.categories[selectedCategory]));
        }
    }, [selectedCategory]);

    const handleRunClick = (run) => {
        setSelectedRun(run);
    };

    const closePopup = () => {
        setSelectedRun(null);
    };

    const handleEditClick = (e, run) => {
        e.stopPropagation();
        setEditingRun(run);
    };

    const closeEditModal = () => {
        setEditingRun(null);
    };

    const handleSaveRunChanges = async (updatedRunData) => {
        try {
            const response = await api.post('/submission/update', updatedRunData);
            if (response.status === 200) {
                setTimeout(() => {
                    closeEditModal();
                    window.location.reload();
                }, 1000);
            } else {
                setError("Failed to update run");
            }
        } catch (error) {
            console.error('Error updating run:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!profileData) {
        return <div>No profile data found</div>;
    }

    const categories = Object.keys(gameData.itt.categories);
    const creationDate = new Date(profileData.creation_date * 1000).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const renderChapterCards = (category) => {
        return chapters.map((chapter) => {
            const categoryKey = category.toLowerCase();
            const chapterKey = chapter.replace("_", " ").toLowerCase();
            const chapterSubmissions = profileData.ordered_submissions &&
            profileData.ordered_submissions[categoryKey] &&
            profileData.ordered_submissions[categoryKey][chapterKey]
                ? profileData.ordered_submissions[categoryKey][chapterKey]
                : [];

            return (
                <Card
                    key={`${category}-${chapter}`}
                    className="col-span-2 bg-fgPrimary border-0"
                >
                    <CardHeader className="bg-fgPrimary border-0">
                        <CardTitle className="p-0 text-tBase font-poppins">
                            <div className="flex items-center justify-between">
                                <p className="text-4xl">{formatChapter(chapter)}</p>
                                <p>
                                    {profileData?.chapter_scores?.[categoryKey]?.[chapterKey] !== undefined
                                        ? `Points: ${profileData.chapter_scores[categoryKey][chapterKey]}`
                                        : ""}
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 font-poppins text-tBase bg-fgThird">
                        {chapterSubmissions.length > 0 ? (
                            <div className="space-y-2">
                                {chapterSubmissions.map((run) => (
                                    <div
                                        key={run.id}
                                        className="flex justify-between items-center p-2 hover:bg-fgSecondary cursor-pointer"
                                        onClick={() => handleRunClick(run)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {getRankDisplay(run.rank)}
                                            <span className="text-sm">{formatSubChapter(run.sub_chapter)}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <span>{run.time_complete}</span>
                                            {isOwnProfile && (
                                                <button
                                                    className="ml-2 p-1 text-tBase hover:text-colorActive transition-colors"
                                                    onClick={(e) => handleEditClick(e, run)}
                                                    title="Edit run"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                        <path d="m15 5 4 4" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 p-4">
                                No runs for this chapter
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        });
    };

    const handleSaveChanges = async (updatedData) => {
        const response = await api.post('/me/edit', updatedData);

        if (response.ok) {
            const updatedUser = { ...user.user, ...updatedData };
            user.setUser(updatedUser);
            setIsSettingsModalOpen(false);
            if (updatedData.username && updatedData.username !== user.user.username) {
                navigate(`/profile/${updatedData.username}`);
            }
        } else {
            // Extract error message from response if available
            let errorMessage = 'Failed to update profile';

            if (response.body?.message) {
                errorMessage = response.body.message;
            } else if (response.body?.error) {
                errorMessage = response.body.error;
            } else if (response.statusText) {
                errorMessage = `Failed to update profile: ${response.statusText}`;
            }

            throw new Error(errorMessage);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-minmax-150">
                {/* Profile Header Card */}
                <Card className="col-span-2 md:col-span-3 bg-fgPrimary text-tBase font-poppins border-0">
                    <CardHeader className="relative">
                        <CardTitle className="text-6xl flex items-center" style={{color: profileData.username_color}}>
                            {username}
                            {profileData.flag && (
                                <span
                                    className={`fi fi-${profileData.flag.toLowerCase()} ml-4`}
                                    title={profileData.flag}
                                    style={{fontSize: '1.5rem'}}
                                />
                            )}
                            {isOwnProfile && (
                                <button
                                    className="absolute top-4 right-4 text-tBase hover:text-colorActive transition-colors"
                                    onClick={() => {
                                        setIsSettingsModalOpen(true);
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path
                                            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            )}

                            {/*<Link*/}
                            {/*    to={`/profile/${profileData.username}/leagues`}*/}
                            {/*    className="text-colorActive absolute top-4 right-4 text-base bg-fgThird rounded-lg px-2 py-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-2 border-colorActive font-bold"*/}
                            {/*>*/}
                            {/*    User League Runs*/}
                            {/*</Link>*/}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <p>Total Runs: {profileData.total_runs}</p>
                            <p>Member Since: {creationDate}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Selection Card */}
                <div className="flex flex-col gap-4 col-span-1">
                    <Card className="flex-1 bg-fgPrimary border-0 col-span-1 row-span-1">
                        <CardContent className="p-6 font-poppins">
                            <div className="flex flex-row space-x-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        className={`${
                                            selectedCategory === category
                                                ? 'border-b-0 bg-colorActive text-tActive'
                                                : 'border-b-bBase text-tBase bg-fgThird'
                                            } cursor-pointer hover:bg-fgSecondary transition-colors hover:text-tDarkBg 
                                                text-sm py-1 px-2 md:text-base md:py-2 md:px-4 md:w-full`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rank Card */}
                <Card className="flex-1 bg-fgPrimary border-0 col-span-1 row-span-2">
                    <CardContent className="p-6 font-poppins text-tBase w-full h-full flex justify-center items-center">
                        <div className=" w-full h-full flex justify-center items-center">
                            {getRankDisplay(profileData.rank, 16, 16, "4xl")}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-fgPrimary border-0 col-span-1 row-span-1">
                    <CardContent className="p-6 font-poppins text-tBase">
                        <div className="flex items-center justify-between">
                            <p>Runs: {profileData.runs}</p>
                            <p>Points: {profileData.score}</p>
                        </div>
                    </CardContent>
                </Card>

                {selectedCategory && renderChapterCards(selectedCategory)}

                {/* Recent Runs Card */}
                <Card className="bg-fgPrimary border-0 col-span-2 md:col-span-1 md:col-start-3 md:row-start-2 md:row-span-9">
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
                                            {profileData.submissions?.slice(0, 9).map((run, index) => (
                                                <div
                                                    key={run.id}
                                                    className="border-0 rounded-none cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => handleRunClick(run)}
                                                >
                                                    <div className="bg-fgSecondary p-3 text-tDarkBg">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-medium font-poppins-medium mr-4">
                                                                {formatCategory(run.category)} - {formatChapter(run.chapter)}
                                                            </h3>
                                                            <div className="flex items-center">
                                                                <p className="font-medium font-poppins-medium">{run.time_complete}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="bg-fgThird p-3 text-tBase flex justify-between items-center">
                                                        <p className="text-sm font-poppins-light">{formatSubChapter(run.sub_chapter)}</p>
                                                        <div className="flex items-center">
                                                            {getRankDisplay(run.rank, 8, 8, 'md', 'text-right')}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="bg-fgThird p-3 text-tBase flex justify-between items-center">
                                                        <p className={`
                                                                        font-poppins
                                                                        text-sm
                                                                        ${showUsernameColor ? "" : "text-tBase"}
                                                                      `}
                                                           style={showUsernameColor ? { color: profileData.username_color } : {}}>{username}</p>
                                                        <p className="text-sm font-poppins">{getDaysAgo(run.date)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </Card>

                {selectedRun && <RunPopup run={selectedRun} onClose={closePopup} username={username} color={profileData.username_color} showUsernameColor={showUsernameColor}/>}
                {editingRun && <EditRunModal run={editingRun} onClose={closeEditModal} onSave={handleSaveRunChanges}/>}
            </div>

            {/* Settings Modal */}
            <UserSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                user={user.user}
                onSave={handleSaveChanges}
            />
        </div>
    );
};

export default ProfileGrid;