import { useParams } from 'react-router-dom';
import LeagueWeeklyLeaderboard from "@/components/LeagueWeeklyLeaderboard.jsx";

const LeaguePage = ({ theme, showUsernameColor }) => {
    const { seasonId } = useParams();

    return (
        <div className="bg-bgPrimary min-h-screen">
            <div>
                <LeagueWeeklyLeaderboard
                    seasonId={seasonId}
                    themeString={theme}
                    showUsernameColor={showUsernameColor}
                />
            </div>
        </div>
    );
}

export default LeaguePage;