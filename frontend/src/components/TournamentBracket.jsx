import React, { useState, useEffect } from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { useApi } from "@/contexts/ApiProvider.jsx";
import {Link} from "react-router-dom";

const TournamentBracket = ({ season = 'su_25', themeString, showUsernameColor }) => {
    const [tournamentData, setTournamentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useApi();

    useEffect(() => {
        const fetchTournamentData = async () => {
            try {
                setLoading(true);
                const endpoint = `/leagues/${season}/results`;
                const response = await api.get(endpoint);

                if (response.ok) {
                    setTournamentData(response.body.data);
                    console.log(response.body.data);
                } else {
                    setError('Failed to fetch tournament data');
                }
            } catch (err) {
                setError('Failed to fetch tournament data');
                console.error('Error fetching tournament:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentData();
    }, [season, api]);

    const handleMatchClick = (match) => {
        if (match.vodUrl) {
            window.open(match.vodUrl, '_blank');
        }
    };

    const MatchComponent = ({ match, isLosers = false }) => {
        const isClickable = match.vodUrl;

        return (
            <div
                className={`
                    h-16 bg-fgThird rounded-lg border-0 w-36 p-1
                    ${isClickable ? 'cursor-pointer hover:opacity-90 hover:shadow-lg transition-all duration-200 hover:-translate-y-1' : ''}
                    ${isLosers ? 'border-l-4 border-l-colorActive' : 'border-l-4 border-l-colorActive'}
                    flex flex-col justify-between relative
                `}
                onClick={() => handleMatchClick(match)}
                title={isClickable ? 'Click to watch VOD' : ''}
            >

                <div className="flex-1 flex flex-col justify-center space-y-0.5">
                    <div className={`
                        text-xs px-1 py-0.5 rounded text-center truncate
                        ${match.winner === match.team1 ? 'bg-colorActive text-tDarkBg font-bold' : 'bg-fgThird text-tBase'}
                    `}>
                        {match.team1 || 'TBD'}
                    </div>

                    <div className={`
                        text-xs px-1 py-0.5 rounded text-center truncate
                        ${match.winner === match.team2 ? 'bg-colorActive text-tDarkBg font-bold' : 'bg-fgThird text-tBase'}
                    `}>
                        {match.team2 || 'TBD'}
                    </div>
                </div>

                <div className="text-xs text-tBase text-center">
                    {match.score && <div className="font-bold text-xs">{match.score}</div>}
                </div>
            </div>
        );
    };

    const ConnectorLine = () => (
        <div className="flex items-center justify-center mx-1">
            <div className="w-4 h-0.5 bg-fgPrimary"></div>
        </div>
    );

    const VerticalConnector = ({ height = "h-6" }) => (
        <div className={`w-0.5 bg-fgSecondary ${height} mx-auto`}></div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-white">Loading tournament bracket...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!tournamentData) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-white">No tournament data available.</div>
            </div>
        );
    }

    return (
        <div className="w-full pt-4">
            <Card className="border-0 bg-fgPrimary rounded-lg overflow-hidden p-4">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-tBase font-poppins text-xl">Full Bracket</CardTitle>
                    <Link
                        to="/leagues"
                        className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                    >
                        Weeks
                    </Link>
                </CardHeader>
                <div className="pl-4 text-tBase font-poppins text-xs">
                    <p>
                        <a href="https://youtu.be/_OhgqLj3hVM" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Click here for the full vod
                        </a>
                    </p>
                </div>
                <CardContent className="p-4">
                    <div className="mb-4">
                    </div>

                    <div className="w-full">
                        <div className="flex flex-col gap-6">
                        <div className="flex gap-6 items-start">
                                {tournamentData.winners_bracket && (
                                    <div className="flex-shrink-0">
                                        <h3 className="text-lg font-bold text-tBase mb-3 text-left">
                                            Winners Bracket
                                        </h3>

                                        <div className="flex items-start gap-2">
                                            {tournamentData.winners_bracket.rounds?.map((round, roundIndex) => (
                                                <React.Fragment key={`winners-${round.name}`}>
                                                    <div className="flex flex-col items-center">
                                                        <h4 className="text-xs font-bold text-tBase mb-2 text-center">
                                                            {round.name}
                                                        </h4>

                                                        <div className="space-y-2">
                                                            {round.matches?.map((match, matchIndex) => (
                                                                <React.Fragment key={match.id}>
                                                                    <MatchComponent match={match} isLosers={false}/>
                                                                    {matchIndex < round.matches.length - 1 && (
                                                                        <VerticalConnector/>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {roundIndex < tournamentData.winners_bracket.rounds.length - 1 && (
                                                        <ConnectorLine/>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tournamentData.grand_finals && (
                                    <div className="flex-shrink-0 ml-4">
                                        <h3 className="text-lg font-bold text-tBase mb-3 text-center">
                                            Grand Finals
                                        </h3>

                                        <div className="flex justify-center">
                                            <div className="space-y-2">
                                                {tournamentData.grand_finals.matches?.map((match) => (
                                                    <div key={match.id} className="flex flex-col items-center">
                                                        <MatchComponent match={match}/>
                                                        {match.bracket_reset && (
                                                            <>
                                                                <div className="text-xs text-tBase my-1">
                                                                    Bracket Reset
                                                                </div>
                                                                <MatchComponent match={match.bracket_reset}/>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {tournamentData.losers_bracket && (
                                <div className="flex-shrink-0">
                                    <h3 className="text-lg font-bold text-tBase mb-3 text-left">
                                        Losers Bracket
                                    </h3>

                                    <div className="flex items-start gap-2">
                                        {tournamentData.losers_bracket.rounds?.map((round, roundIndex) => (
                                            <React.Fragment key={`losers-${round.name}`}>
                                                <div className="flex flex-col items-center">
                                                    <h4 className="text-xs font-bold text-tBase mb-2 text-center">
                                                        {round.name}
                                                    </h4>

                                                    <div className="space-y-2">
                                                        {round.matches?.map((match, matchIndex) => (
                                                            <React.Fragment key={match.id}>
                                                                <MatchComponent match={match} isLosers={true}/>
                                                                {matchIndex < round.matches.length - 1 && (
                                                                    <VerticalConnector/>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>

                                                {roundIndex < tournamentData.losers_bracket.rounds.length - 1 && (
                                                    <ConnectorLine/>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-left space-y-2">
                        <p className="text-xs text-tBase">
                            * Click on a card to watch the VOD
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TournamentBracket;