import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import MayCodyImage from '../assets/Dark_Mode_May_Cody.png';
import MayCodyImageLight from '../assets/Light_Mode_May_Cody_Landing_Page.png';
import MayCodyImageFunLight from '../assets/Fun_Light_Mode_May_Cody.png'
import MayCodyImageFire from '../assets/Fire_Mode_May_Cody.png';
import MayCodyImageStealth from '../assets/Shadow_Mode_May_Cody.png';
import MayCodyImageItt from '../assets/Itt_Mode_May_Cody.png';

const LandingPage = ({ theme }) => {

    let imageSrc;

    switch (theme) {
        case "Dark":
            imageSrc = MayCodyImage;
            break;
        case "Light":
            imageSrc = MayCodyImageLight;
            break;
        case "Light-Fun":
            imageSrc = MayCodyImageFunLight;
            break;
        case "Fire":
            imageSrc = MayCodyImageFire;
            break;
        case "Stealth":
            imageSrc = MayCodyImageStealth;
            break;
        case "Itt":
            imageSrc = MayCodyImageItt;
            break;
        default:
            imageSrc = MayCodyImage;
    }

    useEffect(() => {
        const images = [
            MayCodyImage,
            MayCodyImageLight,
            MayCodyImageFunLight,
            MayCodyImageFire,
            MayCodyImageStealth
        ];

        images.forEach((image) => {
            const img = new Image();
            img.src = image;
        });
    }, []);

    return (
        <div className="flex flex-col mx-auto bg-fgPrimary min-h-screen">
            <div className="bg-gradient-to-b from-bgPrimary bg-fgPrimary bg-[length:100%_400px] bg-no-repeat flex justify-center h-[500px]">
                <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-4">
                    {/* Image container with centered content for mobile */}
                    <div className="relative flex justify-center md:justify-start md:-mr-6 md:mt-12">
                        <div className="relative">
                            <div
                                className="absolute inset-0 w-32 h-32 md:w-80 md:h-80 bg-fgPrimary mix-blend-theme rounded-full md:left-52 md:top-60 left-20 top-24 -translate-x-1/2 -translate-y-1/2 z-10"></div>

                            <img
                                src={imageSrc}
                                alt="May Cody"
                                className="w-40 h-40 md:w-96 md:h-96 z-20"
                            />
                        </div>
                    </div>

                    {/* Text and button container */}
                    <div
                        className="text-tBase font-bold font-poppinsBold text-4xl md:text-8xl text-left mt-6 md:mt-60">
                    <p>IT</p>
                        <div className="relative">
                            <Link to="/itt">
                                <button
                                    className="mt-2 absolute md:-top-16 md:left-24 -top-11 left-10 bg-bgPrimary border-colorActive border-2 text-colorActive md:px-4 md:py-2 px-2 py-1.5 rounded-lg text-xs md:text-sm font-poppins hover:bg-colorActive hover:text-tDarkBg">
                                    LEADERBOARDS
                                </button>
                            </Link>
                        </div>
                        <p>TAKES</p>
                        <p className="mt-0">ONE</p>
                    </div>
                </div>
            </div>
            <div className="bg-fgPrimary flex items-center justify-center h-[200px]">
                <div className="text-tBase font-poppins text-center w-96">
                    <p>Test your skills in solo speedrun segments of It Takes Two, earning points to outpace rivals and
                        climb the leaderboard.</p>
                </div>
            </div>
            <div className="bg-fgPrimary flex items-center justify-center py-8">
                <Card className="w-full max-w-5xl bg-bgPrimary border-0 p-4">
                    <CardHeader className="p-4 pl-6">
                        <CardTitle className="text-tBase font-poppinsBold text-4xl">Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-tBase font-poppins">
                            <li className="flex items-center border-b-2 border-t-2 p-4 border-bBase">
                                <span className="text-tBase font-bold text-4xl pr-3 text-right w-16">#1</span>
                                <div>
                                    <p>You must follow all game rules as listed on the speedrun.com leaderboard. Things
                                        such as:</p>
                                    <ul className="list-disc pl-8 mt-2">
                                        <li>120 FPS Cap</li>
                                        <li>Display FPS</li>
                                        <li>Banned/Permitted Tricks</li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex items-center border-b-2 p-4 pt-2 border-bBase">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#2</span>
                                <p>
                                    Times must be obtained from using the autosplitter. You must run with <i>Ping
                                    Remover</i> enabled, you can
                                    additionally use <i>Comm Gold Resets</i> as some quality of life. Simply open your
                                    splits -&gt; right click
                                    "Edit Splits" -&gt; Settings -&gt; tick "Optional Settings", "Comm Gold Resets" and
                                    importantly <i>Experimental
                                    new timer</i> that 'removes' ping
                                </p>
                            </li>
                            <li className="flex items-center border-b-2 p-4 pt-2 border-bBase">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#3</span>
                                <p>When submitting your times, assume your timer starts at 00:00.00 and submit your time
                                    accordingly</p>
                            </li>
                            <li className="flex items-center border-b-2 p-4 pt-2 border-bBase">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#4</span>
                                <p>Video proof must be required for the top 3 times and/or whether you surpass the
                                    cut-off time which you can see at the top of the times.</p>
                            </li>
                            <li className="flex items-center border-b-2 p-4 pt-2 border-bBase">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#5</span>
                                <p>Videos must include the full run with the timer on screen.</p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="bg-fgPrimary flex items-center justify-center">
                <Card className="w-full max-w-5xl bg-bgPrimary border-0 p-4 mt-10 mb-10">
                    <CardHeader className="p-4 pl-6">
                        <CardTitle className="text-tBase font-poppinsBold text-4xl">How to Participate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-tBase font-poppins">
                            <li className="flex items-center border-b-2 border-t-2 border-bBase p-4">
                                <span className="text-tBase font-bold text-4xl pr-3 text-right w-16">#1</span>
                                <div>
                                    <p>
                                        New accounts are placed in a verification queue, and once approved, you'll be
                                        able to submit runs freely.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-center border-b-2 border-bBase p-4 pt-2">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#2</span>
                                <p>
                                    Our leaderboards rely on self-verification. When submitting a run, you are
                                    responsible for ensuring it meets the leaderboard rules.
                                </p>
                            </li>
                            <li className="flex items-center border-b-2 border-bBase p-4 pt-2">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#3</span>
                                <p>
                                    When submitting your times, assume your timer starts at 00:00.00 and submit your
                                    time
                                    accordingly
                                </p>
                            </li>
                            <li className="flex items-center border-b-2 border-bBase p-4 pt-2">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#4</span>
                                <p>Video proof must be required for the top 3 times. Videos must include the full run with the timer on screen.</p>
                            </li>
                            <li className="flex items-center border-b-2 border-bBase p-4 pt-2">
                                <span className="text-tBase font-bold text-4xl pr-4 text-right w-16">#5</span>
                                <p>Runs will be given points based off of their placement on the leaderboard. For example, last place would get 1 point, 2nd to last would get 2 points, and so on.</p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default LandingPage;