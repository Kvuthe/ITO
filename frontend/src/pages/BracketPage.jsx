import TotalLeagueLeaderboard from "@/components/TotalLeagueLeaderboard.jsx";


const BracketPage = ({ theme, showUsernameColor }) => {


    return (
        <div className="bg-bgPrimary min-h-screen">

            <div className="h-full overflow-auto flex justify-center pt-6">
                <div className="w-3/4 max-w-4xl">
                    <TotalLeagueLeaderboard showUsernameColor={showUsernameColor} themestring={theme}/>
                </div>
            </div>

        </div>
    )

}

export default BracketPage;