import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApi } from "@/contexts/ApiProvider.jsx";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const GameDataEditor = ({ themeString }) => {
    const [gameData, setGameData] = useState(null);
    const [editedData, setEditedData] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const api = useApi();

    // Fetch game data
    const fetchGameData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/game/data');

            if (response.ok) {
                console.log("YES", response.body.data);
                setGameData(response.body.data);
                setEditedData(JSON.stringify(response.body.data, null, 2));
            } else {
                setError(response.message || 'Failed to fetch game data');
            }
        } catch (err) {
            setError('Network error: Unable to fetch game data');
        } finally {
            setLoading(false);
        }
    };

    // Save edited data
    const saveGameData = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate JSON format
            const parsedData = JSON.parse(editedData);

            const response = await api.post('/game/data/edit', {
                ...parsedData
            });

            if (response.ok) {
                setGameData(parsedData);
                setSuccess('Game data saved successfully!');
                setIsEditing(false);
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.message || 'Failed to save game data');
            }
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('Invalid JSON format. Please check your syntax.');
            } else {
                setError('Network error: Unable to save game data');
            }
        } finally {
            setSaving(false);
        }
    };

    // Reset changes
    const resetChanges = () => {
        setEditedData(JSON.stringify(gameData, null, 2));
        setError(null);
        setSuccess(null);
        setIsEditing(false);
    };

    // Check if data has been modified
    const hasUnsavedChanges = () => {
        try {
            return JSON.stringify(JSON.parse(editedData), null, 2) !== JSON.stringify(gameData, null, 2);
        } catch {
            return true; // If JSON is invalid, consider it as changed
        }
    };

    useEffect(() => {
        fetchGameData();
    }, []);

    return (
        <Card className="bg-fgPrimary border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-poppins text-tBase">Game Data Editor</CardTitle>
                    <Button
                        onClick={fetchGameData}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 font-poppins bg-fgThird text-tBase border-0 hover:bg-colorActive hover:text-tActive"
                    >
                        <RefreshCw className={`w-4 h-4  ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Status Messages */}
                {error && (
                    <Alert className="border-red-200 bg-fgThird">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-poppins text-tBase">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-fgThird">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-tBase font-poppins">{success}</AlertDescription>
                    </Alert>
                )}

                {/* JSON Editor */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2 font-poppins">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Loading game data...
                        </div>
                    </div>
                ) : gameData ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-poppins text-tBase">Current Game Data</span>
                                {hasUnsavedChanges() && (
                                    <Badge variant="secondary" className="text-xs font-poppins text-tBase">
                                        Modified
                                    </Badge>
                                )}
                            </div>
                            {hasUnsavedChanges() && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={resetChanges}
                                        variant="ghost"
                                        size="sm"
                                        className="font-poppins text-tBase hover:bg-colorActive hover:text-tActive"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        onClick={saveGameData}
                                        disabled={saving}
                                        size="sm"
                                        className="flex items-center font-poppins gap-2 text-tBase hover:bg-colorActive hover:text-tActive"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Textarea
                            value={editedData}
                            onChange={(e) => {
                                setEditedData(e.target.value);
                                setIsEditing(true);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="h-96 font-mono text-sm resize-y"
                            placeholder="Loading..."
                        />

                        <div className="flex justify-between items-center text-xs text-muted-foreground font-poppins">
                            <span>
                                <Badge className="font-poppins text-tBase text-xs">
                                    Note: If you need help with figuring out how to edit the file, please contact Kvuthe.
                                </Badge>
                            </span>
                            <Badge className="text-xs font-poppins text-tBase">
                                Format: JSON
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GameDataEditor;