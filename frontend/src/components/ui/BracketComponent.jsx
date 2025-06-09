import { Bracket } from 'react-brackets'
import React, { useState, useEffect } from 'react'
import {useApi} from "@/contexts/ApiProvider.jsx";

const BracketComponent = () => {
    // ... (keeping all your existing state and useEffect logic)
    const [winnersBracket, setWinnersBracket] = useState([]);
    const [losersBracket, setLosersBracket] = useState([]);
    const [finals, setFinals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useApi();

    // Custom styling options
    const bracketStyles = {
        winners: {
            bracketBackground: '#f0f9ff', // Light blue background
            connectorColor: '#2563eb',    // Blue connectors
            connectorColorHighlight: '#1d4ed8', // Darker blue on hover
            roundHeader: { backgroundColor: '#3b82f6', color: 'white' }
        },
        losers: {
            bracketBackground: '#fef2f2', // Light red background
            connectorColor: '#dc2626',    // Red connectors
            connectorColorHighlight: '#b91c1c', // Darker red on hover
            roundHeader: { backgroundColor: '#ef4444', color: 'white' }
        },
        finals: {
            bracketBackground: '#f0fdf4', // Light green background
            connectorColor: '#16a34a',    // Green connectors
            connectorColorHighlight: '#15803d', // Darker green on hover
            roundHeader: { backgroundColor: '#22c55e', color: 'white' }
        }
    };

    // Load bracket data from API
    useEffect(() => {
        const loadBracketData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/league/bracket/su_25');
                const data = response.data;

                setWinnersBracket(data.winnersBracket || []);
                setLosersBracket(data.losersBracket || []);
                setFinals(data.finals || []);
            } catch (err) {
                initializeDefaultBracket();
            } finally {
                setLoading(false);
            }
        };

        if (api) {
            loadBracketData();
        } else {
            initializeDefaultBracket();
            setLoading(false);
        }
    }, [api]);

    const initializeDefaultBracket = () => {
        // Default winners bracket
        setWinnersBracket([
            {
                title: 'Winners Round 1',
                seeds: [
                    { id: 1, teams: [{ name: 'Team A' }, { name: 'Team B' }] },
                    { id: 2, teams: [{ name: 'Team C' }, { name: 'Team D' }] },
                    { id: 3, teams: [{ name: 'Team E' }, { name: 'Team F' }] },
                    { id: 4, teams: [{ name: 'Team G' }, { name: 'Team H' }] }
                ]
            },
            {
                title: 'Winners Semifinals',
                seeds: [
                    { id: 5, teams: [{ name: '' }, { name: '' }] },
                    { id: 6, teams: [{ name: '' }, { name: '' }] }
                ]
            },
            {
                title: 'Winners Final',
                seeds: [
                    { id: 7, teams: [{ name: '' }, { name: '' }] }
                ]
            }
        ]);

        // Default losers bracket
        setLosersBracket([
            {
                title: 'Losers Round 1',
                seeds: [
                    { id: 8, teams: [{ name: '' }, { name: '' }] },
                    { id: 9, teams: [{ name: '' }, { name: '' }] }
                ]
            },
            {
                title: 'Losers Round 2',
                seeds: [
                    { id: 10, teams: [{ name: '' }, { name: '' }] },
                    { id: 11, teams: [{ name: '' }, { name: '' }] }
                ]
            },
            {
                title: 'Losers Semifinals',
                seeds: [
                    { id: 12, teams: [{ name: '' }, { name: '' }] }
                ]
            },
            {
                title: 'Losers Final',
                seeds: [
                    { id: 13, teams: [{ name: '' }, { name: '' }] }
                ]
            }
        ]);

        // Grand Finals
        setFinals([
            {
                title: 'Grand Final',
                seeds: [
                    { id: 14, teams: [{ name: '' }, { name: '' }] }
                ]
            }
        ]);
    };

    const handleWinnersClick = (roundIndex, seedIndex, teamIndex) => {
        const winner = winnersBracket[roundIndex].seeds[seedIndex].teams[teamIndex];
        const loser = winnersBracket[roundIndex].seeds[seedIndex].teams[1 - teamIndex];

        const updatedWinners = [...winnersBracket];
        const updatedLosers = [...losersBracket];

        // Advance winner in winners bracket
        if (roundIndex + 1 < updatedWinners.length) {
            const nextSeedIndex = Math.floor(seedIndex / 2);
            const teamSlot = seedIndex % 2;
            updatedWinners[roundIndex + 1].seeds[nextSeedIndex].teams[teamSlot] = {
                name: winner.name
            };
        } else {
            // Winner goes to grand final
            setFinals(prev => {
                const updated = [...prev];
                updated[0].seeds[0].teams[0] = { name: winner.name };
                return updated;
            });
        }

        // Send loser to appropriate losers bracket position
        if (loser.name && loser.name !== '') {
            const losersRoundIndex = calculateLosersPosition(roundIndex, updatedLosers.length);
            if (losersRoundIndex < updatedLosers.length) {
                const targetRound = updatedLosers[losersRoundIndex];
                for (let i = 0; i < targetRound.seeds.length; i++) {
                    const seed = targetRound.seeds[i];
                    for (let j = 0; j < seed.teams.length; j++) {
                        if (!seed.teams[j].name || seed.teams[j].name === '') {
                            seed.teams[j] = { name: loser.name };
                            break;
                        }
                    }
                    if (seed.teams.some(team => team.name === loser.name)) break;
                }
            }
        }

        setWinnersBracket(updatedWinners);
        setLosersBracket(updatedLosers);
    };

    const handleLosersClick = (roundIndex, seedIndex, teamIndex) => {
        const winner = losersBracket[roundIndex].seeds[seedIndex].teams[teamIndex];
        const updatedLosers = [...losersBracket];

        // Advance winner in losers bracket
        if (roundIndex + 1 < updatedLosers.length) {
            const nextSeedIndex = Math.floor(seedIndex / 2);
            const teamSlot = seedIndex % 2;
            updatedLosers[roundIndex + 1].seeds[nextSeedIndex].teams[teamSlot] = {
                name: winner.name
            };
        } else {
            // Winner goes to grand final
            setFinals(prev => {
                const updated = [...prev];
                updated[0].seeds[0].teams[1] = { name: winner.name };
                return updated;
            });
        }

        setLosersBracket(updatedLosers);
    };

    const handleFinalsClick = (roundIndex, seedIndex, teamIndex) => {
        const winner = finals[roundIndex].seeds[seedIndex].teams[teamIndex];
        console.log('Tournament Winner:', winner.name);
    };

    const calculateLosersPosition = (winnersRound, losersLength) => {
        if (winnersRound === 0) return 0;
        if (winnersRound === 1) return 1;
        return Math.min(winnersRound, losersLength - 1);
    };

    const renderBracket = (bracket, title, clickHandler, styleConfig) => (
        <div className="bracket-section mb-8">
            <h3 className="text-xl font-bold mb-4 text-center" style={styleConfig.roundHeader}>
                {title}
            </h3>
            <Bracket
                rounds={bracket.map((round, roundIdx) => ({
                    ...round,
                    seeds: round.seeds.map((seed, seedIdx) => ({
                        ...seed,
                        teams: seed.teams.map((team, teamIdx) => ({
                            ...team,
                            name: (
                                <button
                                    onClick={() => clickHandler(roundIdx, seedIdx, teamIdx)}
                                    className="px-3 py-2 text-sm rounded border min-w-[100px] font-medium transition-all duration-200"
                                    style={{
                                        backgroundColor: team.name && team.name !== '' ? styleConfig.connectorColor : '#f3f4f6',
                                        color: team.name && team.name !== '' ? 'white' : '#6b7280',
                                        borderColor: styleConfig.connectorColor
                                    }}
                                    onMouseEnter={(e) => {
                                        if (team.name && team.name !== '') {
                                            e.target.style.backgroundColor = styleConfig.connectorColorHighlight;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (team.name && team.name !== '') {
                                            e.target.style.backgroundColor = styleConfig.connectorColor;
                                        }
                                    }}
                                    disabled={!team.name || team.name === ''}
                                >
                                    {team.name || 'TBD'}
                                </button>
                            )
                        }))
                    }))
                }))}
                bracketBackground={styleConfig.bracketBackground}
                connectorColor={styleConfig.connectorColor}
                connectorColorHighlight={styleConfig.connectorColorHighlight}
                roundTitleComponent={(title, roundIndex) => (
                    <div
                        className="px-3 py-1 rounded text-sm font-semibold text-center"
                        style={styleConfig.roundHeader}
                    >
                        {title}
                    </div>
                )}
            />
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg">Loading bracket...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="double-elimination-bracket p-4 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Double Elimination Tournament
            </h2>

            {renderBracket(winnersBracket, "🏆 Winners Bracket", handleWinnersClick, bracketStyles.winners)}
            {renderBracket(losersBracket, "💔 Losers Bracket", handleLosersClick, bracketStyles.losers)}
            {renderBracket(finals, "👑 Grand Final", handleFinalsClick, bracketStyles.finals)}
        </div>
    );
};

export default BracketComponent;