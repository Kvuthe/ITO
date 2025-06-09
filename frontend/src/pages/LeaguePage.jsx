import LeagueWeeklyLeaderboard from "@/components/LeagueWeeklyLeaderboard.jsx";
import { themeShadows } from "@/helpers.jsx";

const LeaguePage = ({ theme, showUsernameColor }) => {
    return (
        <div className="bg-bgPrimary min-h-screen">
            <div>
                <LeagueWeeklyLeaderboard
                    themeString={theme}
                    showUsernameColor={showUsernameColor}
                />
            </div>
        </div>
    );
}

export default LeaguePage;