import { useEffect, useRef } from 'react';
import Switch from 'react-switch'

const Footer = ({ themes, currentTheme, setTheme, showUsernameColor, setShowUsernameColor }) => {
    const hasInitialized = useRef(false);

    useEffect(() => {
        hasInitialized.current = true;
    }, []);

    const handleUsernameColorChange = (checked) => {
        if (hasInitialized.current) {
            setShowUsernameColor(checked);
        }
    };


    const themeIcons = {
        'Dark': (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <defs>
                    <style>{`.cls-1{fill:#2e3440;}.cls-2{fill:#242933;}.cls-3{fill:#12151a;}`}</style>
                </defs>
                <polygon className="cls-1" points="27.88 272.12 272.12 272.12 272.12 27.88 27.88 272.12"/>
                <polygon className="cls-2" points="27.88 27.88 27.88 272.12 272.12 27.88 27.88 27.88"/>
                <path className="cls-3" d="M260.09,39.92v220.17H39.91V39.92h220.17M260.68,10H39.32c-16.19,0-29.32,13.13-29.32,29.32v221.36c0,16.19,13.13,29.32,29.32,29.32h221.36c16.19,0,29.32-13.13,29.32-29.32V39.32c0-16.19-13.13-29.32-29.32-29.32h0Z"/>
                <path className="cls-3" d="M188.14,232.99h-65.74l-16.06,31.11h-44.92l94.85-176.15h49.68l32.62,176.15h-45.42l-5.02-31.11ZM183.12,200.37l-10.29-65.24-33.62,65.24h43.91Z"/>
            </svg>
        ),
        'Light-Fun': (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <defs>
                    <style>{`.cls-4{fill:#fff;}.cls-5{fill:#746585;}.cls-6{fill:#dac7e2;}`}</style>
                </defs>
                <polygon className="cls-5" points="27.88 272.12 272.12 272.12 272.12 27.88 27.88 272.12"/>
                <polygon className="cls-6" points="27.88 27.88 27.88 272.12 272.12 27.88 27.88 27.88"/>
                <path className="cls-4" d="M260.09,39.92v220.17H39.91V39.92h220.17M260.68,10H39.32c-16.19,0-29.32,13.13-29.32,29.32v221.36c0,16.19,13.13,29.32,29.32,29.32h221.36c16.19,0,29.32-13.13,29.32-29.32V39.32c0-16.19-13.13-29.32-29.32-29.32h0Z"/>
                <path className="cls-4" d="M193.58,232.99h-65.74l-16.06,31.11h-44.92l94.85-176.15h49.68l32.62,176.15h-45.42l-5.02-31.11ZM188.56,200.37l-10.29-65.24-33.62,65.24h43.91Z"/>
            </svg>
        ),
        'Light': (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <defs>
                    <style>{`.cls-7{fill:#c8cedf;}.cls-8{fill:#fff;}.cls-9{fill:#393161;}`}</style>
                </defs>
                <polygon className="cls-7" points="27.88 272.12 272.12 272.12 272.12 27.88 27.88 272.12"/>
                <polygon className="cls-9" points="27.88 27.88 27.88 272.12 272.12 27.88 27.88 27.88"/>
                <path className="cls-8" d="M260.09,39.92v220.17H39.91V39.92h220.17M260.68,10H39.32c-16.19,0-29.32,13.13-29.32,29.32v221.36c0,16.19,13.13,29.32,29.32,29.32h221.36c16.19,0,29.32-13.13,29.32-29.32V39.32c0-16.19-13.13-29.32-29.32-29.32h0Z"/>
                <path className="cls-8" d="M193.58,232.99h-65.74l-16.06,31.11h-44.92l94.85-176.15h49.68l32.62,176.15h-45.42l-5.02-31.11ZM188.56,200.37l-10.29-65.24-33.62,65.24h43.91Z"/>
            </svg>
        ),
        'Fire': (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <defs>
                    <style>{`.cls-10{fill:#993434;}.cls-11{fill:#0f0000;}.cls-12{fill:#683434;}`}</style>
                </defs>
                <polygon className="cls-10" points="27.88 272.12 272.12 272.12 272.12 27.88 27.88 272.12"/>
                <polygon className="cls-12" points="27.88 27.88 27.88 272.12 272.12 27.88 27.88 27.88"/>
                <path className="cls-11" d="M260.09,39.92v220.17H39.91V39.92h220.17M260.68,10H39.32c-16.19,0-29.32,13.13-29.32,29.32v221.36c0,16.19,13.13,29.32,29.32,29.32h221.36c16.19,0,29.32-13.13,29.32-29.32V39.32c0-16.19-13.13-29.32-29.32-29.32h0Z"/>
                <path className="cls-11" d="M193.58,232.99h-65.74l-16.06,31.11h-44.92l94.85-176.15h49.68l32.62,176.15h-45.42l-5.02-31.11ZM188.56,200.37l-10.29-65.24-33.62,65.24h43.91Z"/>
            </svg>
        )
    };

    return (
        <footer className="flex flex-col md:flex-row justify-between items-center bg-bgPrimary text-tBase p-4 mt-auto">
            {/* Left side */}
            <div className="flex flex-wrap gap-6 mb-4 md:mb-0">
                <a
                    href="https://discord.gg/G6Y4fxukGW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-tBase cursor-pointer"
                >
                    Discord
                </a>
                <a
                    href="https://www.speedrun.com/itt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-tBase cursor-pointer"
                >
                    Speedrun.com
                </a>
                <a
                    href="https://docs.google.com/spreadsheets/d/1HRM0_ryN8ZQTtiPdv0i0bw1Kfl410pnwnqlvOxSdvMY/edit?gid=1461898207#gid=1461898207"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-tBase cursor-pointer"
                >
                    Tutorials
                </a>
                <a
                    href="https://docs.google.com/spreadsheets/d/1HWs8KetS_kpDhSOQPrAmfkNTstuWiftN7_a6a2xiaCs/edit?gid=0#gid=0&range=A1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-tBase cursor-pointer"
                >
                    Bounties
                </a>
                <a
                    href="https://www.twitch.tv/kvuthe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-tBase cursor-pointer"
                >
                    Support Me
                </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                <div className="flex gap-4">
                    {themes.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`p-1 rounded-md ${t === currentTheme ? 'ring-2 ring-colorActive' : 'hover:bg-bgSecondary'}`}
                            aria-label={`Set ${t} theme`}
                        >
                            {themeIcons[t]}
                        </button>
                    ))}
                </div>


                <label className="flex items-center cursor-pointer font-poppins text-tBase">
                    <Switch
                        checked={showUsernameColor}
                        onChange={handleUsernameColorChange}
                        handleDiameter={30}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={20}
                        width={48}
                        onColor="#808080"
                        offColor="#f0f0f0"
                        onHandleColor="#ffffff"
                        offHandleColor="#ffffff"
                    />
                </label>

            </div>
        </footer>
    );
};

export default Footer;