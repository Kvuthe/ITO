import React from 'react';
import RecentRunsCard from '../components/RecentRunsCard.jsx';
import HighlightCard from '../components/HighlightCard.jsx';
import LeaderboardComponent from "@/components/LeaderboardComponent.jsx";
import {useUser} from "@/contexts/UserProvider.jsx";
import {themeShadows} from "../helpers.jsx"

const MainPage = ({ theme, showUsernameColor }) => {
    const user = useUser();

    return (
        <div className="bg-bgPrimary min-h-screen">
            <div className="relative mx-auto pt-6 w-full max-w-7xl flex flex-col">
                <div className="flex flex-col md:flex-row flex-grow gap-0">
                    <div className="flex flex-col md:w-2/3 h-full">
                        <div className="h-full overflow-auto">
                            <LeaderboardComponent
                                user={user.user}
                                themeString={themeShadows[theme]}
                                showUsernameColor={showUsernameColor}
                                className="h-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:w-1/3 space-y-4">
                        <HighlightCard
                            themeString={themeShadows[theme]}
                            showUsernameColor={showUsernameColor}
                        />
                        <RecentRunsCard
                            themeString={themeShadows[theme]}
                            showUsernameColor={showUsernameColor}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;