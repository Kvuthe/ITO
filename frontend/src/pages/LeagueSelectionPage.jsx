import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApi } from "@/contexts/ApiProvider.jsx";
import {formatSeasonName} from "@/helpers.jsx";

export default function LeagueSelectionPage() {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const api = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/leagues/all_seasons');

            if (!response.ok) {
                throw new Error("Failed to fetch seasons");
            }

            const data = await response.body.data;
            setSeasons(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonClick = (seasonId) => {
        navigate(`/leagues/${seasonId}`);
    };

    return (
        <div className="bg-bgPrimary min-h-screen">
            <div className="max-w-7xl mx-auto p-4">
                <Card className="bg-fgPrimary border-none">
                    <CardHeader>
                        <CardTitle className="text-tBase font-poppins text-2xl">
                            Select a Season
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="text-tBase font-poppins">Loading seasons...</div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center py-12">
                                <div className="text-red-500 font-poppins">Error: {error}</div>
                            </div>
                        ) : seasons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {seasons.map((season) => (
                                    <button
                                        key={season}
                                        onClick={() => handleSeasonClick(season)}
                                        className="bg-fgThird hover:bg-colorActive text-tBase hover:text-tActive transition-colors p-6 rounded-lg border-2 border-transparent hover:border-colorActive font-poppins"
                                    >
                                        <h3 className="text-xl font-bold mb-2">
                                            {`${formatSeasonName(season)}`}
                                        </h3>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center py-12">
                                <div className="text-tBase font-poppins">No seasons available</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}