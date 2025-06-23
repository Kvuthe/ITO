import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApi } from '@/contexts/ApiProvider.jsx';
import gameData from '../GameData.json';

const SubmissionPage = () => {
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formOptions, setFormOptions] = useState({
        categories: [],
        chapters: [],
        subChapters: []
    });

    const cardRef = useRef(null);

    const gameTitle = 'It Takes Two';

    useEffect(() => {
        const gameKey = gameTitle === 'It Takes Two' ? 'itt' : 'sf';
        const categories = Object.keys(gameData[gameKey].categories);

        setFormOptions(prev => ({
            ...prev,
            categories
        }));
    }, [gameTitle]);

    const [formData, setFormData] = useState({
        game_title: gameTitle,
        category: '',
        chapter: '',
        sub_chapter: '',
        video_url: '',
        minutes: '',
        seconds: '',
        milliseconds: '',
        description: '',
        submissionDate: new Date().toISOString().split('T')[0] // Default to today's date
    });

    const handleCategorySelect = (value) => {
        handleChange('category', value);

        const gameKey = gameTitle === 'It Takes Two' ? 'itt' : 'sf';
        const chapters = Object.keys(gameData[gameKey].categories[value]);

        setFormOptions(prev => ({
            ...prev,
            chapters,
            subChapters: []
        }));
    };

    const handleChapterSelect = (value) => {
        handleChange('chapter', value);

        const gameKey = gameTitle === 'It Takes Two' ? 'itt' : 'sf';
        const subChapters = Object.keys(gameData[gameKey].categories[formData.category][value]);

        setFormOptions(prev => ({
            ...prev,
            subChapters
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const minutes = formData.minutes === '' ? 0 : formData.minutes;
        const seconds = formData.seconds === '' ? 0 : formData.seconds;
        const milliseconds = formData.milliseconds === '' ? 0 : formData.milliseconds

        const timeComplete = `${minutes}:${seconds}:${milliseconds}`;

        try {
            const response = await api.post('/submission/create', {
                ...formData,
                minutes,
                seconds,
                milliseconds,
                time_complete: timeComplete,
                submissionDate: formData.submissionDate
            });
            if (response.ok) {
                setSuccess(true);
                setFormData({
                    game_title: gameTitle,
                    category: '',
                    chapter: '',
                    sub_chapter: '',
                    video_url: '',
                    minutes: '',
                    seconds: '',
                    milliseconds: '',
                    description: '',
                    submissionDate: new Date().toISOString().split('T')[0]
                });
            } else {
                throw new Error(response.body?.message || 'Failed to create submission');
            }
        } catch (err) {
            console.log(err)
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
            <Card className="w-full max-w-xl h-[900px] overflow-auto bg-fgPrimary border-0 mt-24" ref={cardRef}>
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-tBase font-poppins">Submit Run</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Success and Error Messages */}
                    {error && (
                        <>
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative">
                                {error}
                            </div> <div className="pb-4"></div>
                        </>
                    )}

                    {success && (
                        <>
                            <div className="bg-fgThird border border-green-400 text-tBase px-4 py-3 rounded relative">
                                Submission created successfully!
                            </div> <div className="pb-4"></div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formData.game_title && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-tBase font-poppins">Category</label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={handleCategorySelect}
                                    >
                                        <SelectTrigger className="bg-fgThird border-0 text-tBase font-poppins">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="text-sm bg-fgThird text-tBase border-0 font-poppins dropdown-content"
                                            position="popper"
                                            sideOffset={5}
                                            align="start"
                                            avoidCollisions={false}
                                        >
                                            {formOptions.categories.map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.category && (
                                    <div className="space-y-2">
                                        <label className="text-sm text-tBase font-poppins">Chapter</label>
                                        <Select
                                            value={formData.chapter}
                                            onValueChange={handleChapterSelect}
                                        >
                                            <SelectTrigger className="bg-fgThird border-0 text-tBase font-poppins">
                                                <SelectValue placeholder="Select chapter" />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="text-sm bg-fgThird text-tBase border-0 font-poppins dropdown-content"
                                                position="popper"
                                                sideOffset={5}
                                                align="start"
                                                avoidCollisions={false}
                                            >
                                                {formOptions.chapters.map((chapter, index) => (
                                                    <SelectItem key={index} value={chapter}>
                                                        {chapter}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {formData.chapter && (
                                    <div className="space-y-2">
                                        <label className="text-sm text-tBase font-poppins">Sub Chapter</label>
                                        <Select
                                            value={formData.sub_chapter}
                                            onValueChange={(value) => handleChange('sub_chapter', value)}
                                        >
                                            <SelectTrigger className="bg-fgThird border-0 text-tBase font-poppins">
                                                <SelectValue placeholder="Select sub chapter" />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="text-sm bg-fgThird text-tBase border-0 font-poppins dropdown-content"
                                                position="popper"
                                                sideOffset={5}
                                                align="start"
                                                avoidCollisions={false}
                                            >
                                                {formOptions.subChapters.map((subChapter, index) => (
                                                    <SelectItem key={index} value={subChapter}>
                                                        {subChapter}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

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

                                {/* Submission Date Field */}
                                <div className="space-y-2">
                                    <label className="text-sm text-tBase font-poppins">Submission Date</label>
                                    <Input
                                        type="date"
                                        value={formData.submissionDate}
                                        onChange={(e) => handleChange('submissionDate', e.target.value)}
                                        className="w-full text-tBase font-poppins bg-fgThird border-0"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {/* Description Field */}
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
                            </>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Run'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubmissionPage;