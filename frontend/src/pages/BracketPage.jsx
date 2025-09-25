import TotalLeagueLeaderboard from "@/components/TotalLeagueLeaderboard.jsx";
import TournamentBracket from "@/components/TournamentBracket.jsx";


const BracketPage = ({ theme, showUsernameColor }) => {


    return (
        <div className="bg-bgPrimary min-h-screen flex justify-center">
            <div className="w-8/12 ">
                <TournamentBracket showUsernameColor={showUsernameColor} themestring={theme}/>
            </div>
        </div>
    )

}

export default BracketPage;