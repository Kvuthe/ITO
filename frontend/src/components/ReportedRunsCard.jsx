import React, { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getDaysAgo, convertToEmbedUrl, formatChapter, formatCategory, formatSubChapter } from "@/helpers.jsx";
import { useApi } from "@/contexts/ApiProvider.jsx";

const CustomModal = ({
                         isOpen,
                         onClose,
                         onConfirm,
                         actionType = 'remove'
                     }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-bgPrimary rounded-lg shadow-lg p-6 max-w-md w-full transform transition-all"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2 font-poppins text-tBase">
                        Confirm {actionType === 'restore' ? 'Restore' : 'Remove'}
                    </h2>
                    <p className="text-tBase">
                        Are you sure you want to {actionType} this run?
                        {actionType === 'remove' ? ' This action cannot be undone.' : ''}
                    </p>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border-0 hover:bg-fgThird transition-colors font-poppins text-tBase hover:text-colorActive"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded text-tBase transition-colors font-poppins ${
                            actionType === 'restore'
                                ? 'bg-green-800 hover:bg-green-800'
                                : 'bg-red-800 hover:bg-red-800'
                        }`}
                    >
                        Yes, {actionType}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportedRunsCard = () => {
    const [reportedRuns, setReportedRuns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRun, setExpandedRun] = useState(null);
    const api = useApi();
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [selectedRunId, setSelectedRunId] = useState(null);

    const fetchReportedRuns = async () => {
        try {
            const endpoint = '/submission/reports';
            const response = await api.get(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch reported runs');
            }

            setReportedRuns(response.body.data);
        } catch (err) {
            console.error("Error fetching reported runs:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportedRuns();
    }, []);

    const formatTime = (timeString) => {
        return timeString;
    };

    const toggleRunExpansion = (runId) => {
        setExpandedRun(expandedRun === runId ? null : runId);
    };

    const handleActionClick = (e, runId, action) => {
        e.stopPropagation(); // Prevent row expansion when clicking the button
        setSelectedRunId(runId);
        setActionType(action);
        setConfirmationOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            const endpoint = actionType === 'restore'
                ? '/submission/restore'
                : '/submission/remove';

            const response = await api.post(endpoint, { id: selectedRunId });

            if (!response.ok) {
                throw new Error(`Failed to ${actionType} run`);
            }

            await fetchReportedRuns();

            setConfirmationOpen(false);
        } catch (err) {
            console.error(`Error ${actionType}ing run:`, err);
            setError(err.message);
            setConfirmationOpen(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-tBase">Reported Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-tBase" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-tBase">Reported Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-tBase p-4">
                        Error loading reported runs: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (reportedRuns.length === 0) {
        return (
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-tBase">Reported Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-tBase">
                        No reported runs to display
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader className="text-tBase font-poppins">
                    <CardTitle>Reported Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableBody>
                                {reportedRuns.map((run) => (
                                    <React.Fragment key={run.id}>
                                        <TableRow
                                            className={`${expandedRun === run.id ? 'border-b-0 bg-fgSecondary text-tDarkBg' : 'border-b-bBase'} 
                                          cursor-pointer bg-fgThird font-poppins hover:bg-fgSecondary transition-colors text-tBase hover:text-tDarkBg`}
                                            onClick={() => toggleRunExpansion(run.id)}
                                        >
                                            <TableCell className="pl-4">{run.user}</TableCell>
                                            <TableCell>{formatChapter(run.chapter)}</TableCell>
                                            <TableCell>{formatTime(run.time_complete)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{getDaysAgo(run.reported_date)}</TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-green-800 hover:bg-green-800 text-tDarkBg font-poppins border-0"
                                                        onClick={(e) => handleActionClick(e, run.id, 'restore')}
                                                    >
                                                        Restore
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-red-800 hover:bg-red-800 text-tDarkBg font-poppins border-0"
                                                        onClick={(e) => handleActionClick(e, run.id, 'remove')}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {expandedRun === run.id && (
                                            <TableRow className="border-b-bBase border-b-2 bg-fgSecondary hover:bg-fgSecondary">
                                                <TableCell colSpan={6} className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="bg-fgThird rounded-lg p-4 text-tBase">
                                                            <div className="flex justify-between items-center">
                                                                <h3 className="font-poppins text-lg mb-2">
                                                                    {formatCategory(run.category)} - {formatSubChapter(run.sub_chapter)}
                                                                </h3>
                                                                <span className="text-sm text-tBase">Reported by: {run.reporter.username}</span>
                                                            </div>
                                                            <p className="whitespace-pre-wrap">{run.reported_message}</p>
                                                        </div>

                                                        {run.video_url && (
                                                            <div className="w-full aspect-video rounded-lg overflow-hidden">
                                                                <iframe
                                                                    src={convertToEmbedUrl(run.video_url)}
                                                                    className="w-full h-full"
                                                                    allowFullScreen
                                                                    title={`Run by ${run.user}`}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                ></iframe>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <CustomModal
                isOpen={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={handleConfirmAction}
                actionType={actionType}
            />
        </>
    );
};

export default ReportedRunsCard;