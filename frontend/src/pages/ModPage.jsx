import ReportedRunsCard from '../components/ReportedRunsCard.jsx';
import RecentRunsCard from '../components/RecentRunsCard.jsx';
import VerificationCard from '../components/VerificationCard.jsx';
import GameDataEditor from '../components/GameDataEditor.jsx';
import {themeShadows} from "../helpers.jsx"

const ModPage = ({ theme }) => {

    return (
        <div className="bg-bgPrimary min-h-screen">
            <div className="mx-auto p-6 w-full max-w-7xl">
                <div className="flex flex-col gap-6">
                    {/* First Row */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col md:w-1/2 gap-6">
                            <ReportedRunsCard />
                            <VerificationCard />
                        </div>

                        <div className="md:w-1/2">
                            <RecentRunsCard themeString={themeShadows[theme]} />
                        </div>
                    </div>

                    <div className="w-full">
                        <GameDataEditor themeString={themeShadows[theme]} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModPage;