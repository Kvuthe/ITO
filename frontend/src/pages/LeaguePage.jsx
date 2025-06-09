import TotalLeagueComponent from "@/components/TotalLeagueComponent.jsx";
import LeagueWeeklyLeaderboard from "@/components/LeagueWeeklyLeaderboard.jsx";
import { themeShadows } from "@/helpers.jsx";

const LeaguePage = ({ theme, showUsernameColor }) => {
    return (
        <div className="bg-bgPrimary min-h-screen">
            <div>
                <LeagueWeeklyLeaderboard
                    themeString={themeShadows[theme]}
                    showUsernameColor={showUsernameColor}
                />
            </div>

            {/*<div className="lg:w-4/12 mt-6 lg:mt-0">*/}
            {/*    <TotalLeagueComponent themeString={themeShadows[theme]} />*/}
            {/*</div>*/}
        </div>
    );
}

export default LeaguePage;