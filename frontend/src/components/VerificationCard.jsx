import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApi } from "@/contexts/ApiProvider.jsx";
import { getDaysAgo } from "../helpers.jsx"

const VerificationCard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedUser, setExpandedUser] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(null);
    const api = useApi();

    const fetchUsers = async () => {
        try {
            const endpoint = '/mod/verification_queue';
            const response = await api.get(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            setUsers(response.body.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserExpansion = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const handleVerifyUser = async (e, userId) => {
        e.stopPropagation();
        setActionInProgress(userId);

        try {
            const response = await api.post('/mod/user/verify', { id: userId });

            if (!response.ok) {
                throw new Error('Failed to verify user');
            }

            await fetchUsers();

        } catch (err) {
            console.error("Error verifying user:", err);
            setError(err.message);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDenyUser = async (e, userId) => {
        e.stopPropagation();
        setActionInProgress(userId);

        try {
            const response = await api.post('/mod/user/deny', { id: userId });

            if (!response.ok) {
                throw new Error('Failed to deny user');
            }

            await fetchUsers();

        } catch (err) {
            console.error("Error denying user:", err);
            setError(err.message);
        } finally {
            setActionInProgress(null);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-tBase">User Verification</CardTitle>
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
                    <CardTitle className="text-tBase">User Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-tBase p-4">
                        Error loading users: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (users.length === 0) {
        return (
            <Card className="border-0 bg-fgPrimary overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-tBase">User Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-tBase">
                        No users to be verified
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 bg-fgPrimary overflow-hidden">
            <CardHeader className="text-tBase font-poppins">
                <CardTitle>User Verification</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto">
                    <Table>
                        <TableBody>
                            {users.map((user) => (
                                <React.Fragment key={user.id}>
                                    <TableRow
                                        className={`${expandedUser === user.id ? 'border-b-0 bg-fgSecondary text-tDarkBg' : 'border-b-bBase'} 
                                          cursor-pointer bg-fgThird font-poppins hover:bg-fgSecondary transition-colors text-tBase hover:text-tDarkBg`}
                                        onClick={() => toggleUserExpansion(user.id)}
                                    >
                                        <TableCell className="pl-4">{user.username}</TableCell>
                                        <TableCell className="whitespace-nowrap">{getDaysAgo(user.creation_date)}</TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-green-800 hover:bg-green-800 text-tDarkBg font-poppins border-0"
                                                    onClick={(e) => handleVerifyUser(e, user.id)}
                                                    disabled={actionInProgress === user.id}
                                                >
                                                    {actionInProgress === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    ) : 'Verify'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-red-800 hover:bg-red-800 text-tDarkBg font-poppins border-0"
                                                    onClick={(e) => handleDenyUser(e, user.id)}
                                                    disabled={actionInProgress === user.id}
                                                >
                                                    {actionInProgress === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                    ) : 'Deny'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {expandedUser === user.id && (
                                        <TableRow className="border-b-bBase border-b-2 bg-fgSecondary hover:bg-fgSecondary">
                                            <TableCell colSpan={3} className="p-4">
                                                <div className="space-y-4">
                                                    <div className="bg-fgThird rounded-lg p-4 text-tBase">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-poppins text-lg mb-2">
                                                                User Details
                                                            </h3>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="font-semibold">Email:</span> {user.email || 'N/A'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Pronouns:</span> {user.pronouns || 'N/A'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Country:</span> {user.flag || 'N/A'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Score:</span> {user.score}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Role:</span> {user.role === 0 ? 'User' : 'Admin'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">LB Preference:</span> {user.lb_pref}
                                                            </div>
                                                        </div>
                                                    </div>
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
    );
};

export default VerificationCard;