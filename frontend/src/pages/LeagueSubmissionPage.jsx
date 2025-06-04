import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApi } from '@/contexts/ApiProvider.jsx';
import { useUser } from '@/contexts/UserProvider.jsx';

const LeagueSubmissionPage = () => {
    const api = useApi();
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const cardRef = useRef(null);

    const [formData, setFormData] = useState({
        week: '',
        level: '',
        video_url: '',
        minutes: '',
        seconds: '',
        milliseconds: ''
    });

    const weekOptions = Array.from({ length: 8 }, (_, i) => i + 1);

    const levelOptions = [
        1,
        2,
        3,
        4
    ];

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
                minutes,
                seconds,
                milliseconds
            });

            if (response.ok) {
                setSuccess(true);
                setFormData({
                    week: '',
                    level: '',
                    video_url: '',
                    minutes: '',
                    seconds: '',
                    milliseconds: ''
                });
            } else {
                throw new Error(response.body?.message || 'Failed to create league submission');
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
            <Card className="w-full max-w-xl h-[700px] overflow-auto bg-fgPrimary border-0 mt-24" ref={cardRef}>
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-tBase font-poppins">Submit League Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <>
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative">
                                Failed to submit league entry
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
                        {/* Week Selection */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Week</label>
                            <Select
                                value={formData.week}
                                onValueChange={(value) => handleChange('week', value)}
                            >
                                <SelectTrigger className="bg-fgThird border-0 text-tBase font-poppins">
                                    <SelectValue placeholder="Select week" />
                                </SelectTrigger>
                                <SelectContent
                                    className="text-sm bg-fgThird text-tBase border-0 font-poppins dropdown-content"
                                    position="popper"
                                    sideOffset={5}
                                    align="start"
                                    avoidCollisions={false}
                                >
                                    {weekOptions.map(week => (
                                        <SelectItem key={week} value={week.toString()}>
                                            Week {week}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    {levelOptions.map((level, index) => (
                                        <SelectItem key={index} value={level}>
                                            {level}
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
                            disabled={loading || !formData.week || !formData.level || !formData.video_url}
                        >
                            {loading ? 'Submitting...' : 'Submit League Entry'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeagueSubmissionPage;