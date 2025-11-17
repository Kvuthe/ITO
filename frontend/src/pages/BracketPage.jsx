import TotalLeagueLeaderboard from "@/components/TotalLeagueLeaderboard.jsx";
import TournamentBracket from "@/components/TournamentBracket.jsx";
import {useParams} from "react-router-dom";


const BracketPage = ({ theme, showUsernameColor }) => {
    const { seasonId } = useParams();

    return (
        <div className="bg-bgPrimary min-h-screen flex justify-center">
            <div className="w-8/12 ">
                <TotalLeagueLeaderboard seasonId={seasonId} showUsernameColor={showUsernameColor} themestring={theme}/>
                {/*<TournamentBracket showUsernameColor={showUsernameColor} themestring={theme}/>*/}
            </div>
        </div>
    )

}

export default BracketPage;