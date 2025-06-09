import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="h-16 flex items-center justify-between px-4 bg-fgPrimary relative">
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-tBase hover:text-tActive focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-4 absolute md:static top-16 left-0 bg-fgPrimary w-full md:w-auto z-10`}>
                    <Link
                        to="/itt"
                        className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                    >
                        Leaderboards
                    </Link>

                    <Link
                        to="/leagues"
                        className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                    >
                        Leagues
                    </Link>

                    {user && (
                        <Link to="/new_submission" className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppinsBold border-colorActive border-2 font-bold">
                            Submit Run
                        </Link>
                    )}

                    {user && user.role === 2 && (
                        <Link
                            to="/mod_page"
                            className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                        >
                            Mod Page
                        </Link>
                    )}
                </div>

                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 bg-fgPrimary w-full z-10 p-4 flex flex-col space-y-2">
                        {user ? (
                            <>
                                {user && (
                                    <Link
                                        to="/new_submission"
                                        className="w-auto text-center text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppinsBold border-colorActive border-2 font-bold"
                                        onClick={toggleMenu}
                                    >
                                        Submit Run
                                    </Link>
                                )}

                                {user && user.role === 2 && (
                                    <Link
                                        to="/mod_page"
                                        className="w-auto text-center text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppins border-colorActive border-2 font-bold"
                                        onClick={toggleMenu}
                                    >
                                        Mod Page
                                    </Link>
                                )}

                                <Link
                                    to="/itt"
                                    className="w-auto text-center text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppinsBold border-colorActive border-2 font-bold"
                                    onClick={toggleMenu}
                                >
                                    Leaderboards
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/itt"
                                className="w-1/2 text-center text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppinsBold border-colorActive border-2 font-bold"
                                onClick={toggleMenu}
                            >
                                Leaderboards
                            </Link>
                        )}
                    </div>
                )}

                {/* Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link to="/">
                        <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 296.38 246.06"
                             className="w-full h-12 fill-tBase hover:fill-colorActive cursor-pointer">
                            <path
                                d="M237.17,81.6l-11.96,5.63c1.22,2.92,2.07,6.36,2.36,10.38,1.98,8.16,3.06,16.66,3.06,25.42,0,2.18-.08,4.35-.21,6.5,0,.16-.03.32-.04.48-.14,2.08-.33,4.15-.58,6.2-.46,3.72-1.13,7.38-1.95,10.98-1.25-.57-2.69-.69-4.46-.32-1.8.36-3.67.69-5.45.49-1.23-.15-3.01-1.03-3.39-2-2.75-6.99-4.96-14.1-4.08-22.06,3.62.1,4.62-2.11,4.88-4.88.51-5.8,1.26-11.64,1.34-17.47.08-6.6-1.67-12.69-7.6-16.72-.18-.13-.05-.67-.13-1.54,2.39-1.13,4.96-2.31,8.01-3.75-3.85-3.26-7.86-4.8-12.33-4.88-2.77-.05-4.01-1.41-5.42-3.65-2.52-3.96-5.63-7.58-8.6-11.22-.54-.67-1.67-.87-3.06-1.57.21,3.16.36,5.65.54,8.09-.67.05-1.13.23-1.34.08-6.01-4.39-12.61-4.29-19.42-2.67-7.14,1.72-14.36,2.93-21.73,2.62-.46,0-.92.46-1.31.64v5.32c-3.29-.46-6.19-.87-9.17-1.28-1,4.6,1.36,7.27,3.83,9.66,2.08,2.03,2.54,4.19,2.18,6.91-.82,6.4-1.95,12.64-5.24,18.31-.72,1.26-1.21,2.67-1.82,3.98-.87,1.8-1.08,3.52.54,5.03,1.88,1.72,1.7,3.88,1.36,6.11-.69,4.49-1.23,9.04-2.05,13.54-.59,3.26.21,5.57,3.08,7.45,4.44,2.9,8.71,6.06,13,9.17,1.41,1.03,2.72,2.21,5.06,4.14-5.52,1.9-9.73,3.54-14.18,4.73-3.11.82-5.6,3.06-7.17,5.88-3.13,5.69-6.49,11.27-9.66,16.95-6.06-5.85-12.08-11.73-17.91-17.8-2.62-2.72-6.14-4.29-9.89-4.55-2.65-.21-5.27-.69-7.96-1.05-.28-4.91.67-8.45,4.34-11.2,4.08-3.06,7.81-6.63,11.94-9.63,3.06-2.23,4.73-5.86,4.93-9.63.39-7.19,1.13-14.33,1.46-21.5.18-3.62,1.1-5.96,4.91-6.86,2.39-.57,4.06-2.8,3.47-5.16-1.52-6.37-3.62-12.53-6.99-18.13-4.26-7.11-11.58-12.2-19.73-13.77-1.21-.23-2.36-.62-3.36-.87,0-4.26-.21-8.09.03-11.89,1.08-17.21-17.36-35.34-39.25-29.59-2.93.77-5.68,1.98-8.2,3.5-4.47,2.7-8.22,6.45-10.91,10.87-3.21,5.25-4.94,11.42-4.65,17.82.13,3.11.54,6.14.9,9.71-2.23.15-4.03.18-5.8.41-2.16.28-4.42.44-6.42,1.21-1.05.41-2.44,2.08-2.34,3.06.36,3.72.39,7.65,2.7,10.99,5.86-.54,11.56-2.65,17.83.08-.85,1.98-1.46,3.7-2.31,5.32-4.91,9.35-7.83,19.65-9.32,30.1-.95,6.6-.69,6.96,5.47,9.02,1.23.41,2.41.9,3.67,1.18,3.39.69,4.73,2.67,4.8,6.16.13,5.11.64,10.22,1.31,15.28.59,4.67,1.39,5.16,6.09,4.93.92-.03,1.82-.15,2.75-.23,5.37-.57,5.34-.57,6.01-6.14.1-.8.51-1.57,1.08-3.18,5.45,4.16,10.58,7.63,15.15,11.74,3.93,3.52,2.52,10.17-2.41,12.05-5.8,2.18-11.61,4.26-17.47,6.22-3.03,1-5.65,2.9-7.53,5.47-1.94,2.67-3.92,5.32-5.88,7.98-2.43-3.5-4.66-7.14-6.66-10.92-.6-1.13-1.17-2.27-1.73-3.42-.32-.66-.63-1.33-.94-2-5.43-11.81-8.79-24.75-9.6-38.38-1.29-.98-2.48-2.19-3.45-3.79-2.85-4.66-2.17-9.37-1.57-13.51,1.17-8.18,3.08-15.87,5.72-22.97l-6.4.59-3.66-5.29s-.01-.03-.02-.04C2.21,96.57,0,109.55,0,123.03c0,21.28,5.46,41.3,15.01,58.78.01.02.02.04.03.06.67,1.23,1.37,2.45,2.09,3.66.04.07.08.13.12.2.37.63.74,1.26,1.12,1.89,0,0,.01-.02.02-.03,21.7,35.06,60.47,58.48,104.64,58.48,58.79,0,108.05-41.46,120.16-96.66,0,0,0,0,0,0h0c.91-4.14,1.61-8.35,2.09-12.63.02-.14.04-.28.05-.42.21-1.9.36-3.82.48-5.75.02-.31.05-.62.07-.94.12-2.2.18-4.4.18-6.63,0-14.76-2.63-28.91-7.42-42.04l-1.47.61Z"/>
                            <path
                                d="M123.03,15.43c23.63,0,45.49,7.67,63.25,20.63.15-5.62,1.66-11.03,4.35-15.74C171.22,7.49,147.99,0,123.03,0c-18.09,0-35.25,3.95-50.74,10.99,5.99,2.13,11.5,5.59,16.08,10.19,10.88-3.71,22.53-5.76,34.65-5.76Z"/>
                            <path
                                d="M294.36,43.05c-9.81-8.91-21.16-14.46-34.39-15.77-12.18-1.21-24.09,4.26-32.59,13.07-1.72,1.78-3.13,3.26-4.34,4.55-7.21,7.67-6.43,7.88-8.32,14.28,3.7.69,6.5,1.44,9.35,1.67,2.89.24,5.69.03,8.43-.48,4.55-.84,8.94-2.5,13.3-4.25,6.42-2.59,12.74-5.47,19.26-7.83,8.5-3.11,17.29-4.49,26.38-2.9,1.36.23,2.77.18,4.96.31-1-1.31-1.41-2.08-2.03-2.65Z"/>
                            <path
                                d="M204.74,52.37c6.43-5.55,8-15.51,4.87-23.24-1.26-3.11-3.25-5.87-6.03-7.82-.41.4-.78.83-1.15,1.26-7.73,8.98-6.64,24.47,2.31,29.79Z"/>
                        </svg>
                    </Link>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                    {user ? (
                        <>
                            <Link to={`/profile/${user.username}`} className="text-tBase hover:text-tDarkBg font-poppins">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                                     className="fill-tBase w-8 h-8 hover:fill-colorActive">
                                    <path
                                        d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/>
                                </svg>
                            </Link>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"
                                 className="fill-tBase h-8 w-8 hover:fill-colorActive cursor-pointer" onClick={handleLogout}>
                                <path
                                    d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
                            </svg>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-tBase hover:text-tActive font-poppins">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                                     width="24px" className="fill-tBase w-8 h-8 hover:fill-colorActive">
                                    <path
                                        d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/>
                                </svg>
                            </Link>
                            <Link to="/register" className="block text-colorActive bg-fgThird rounded-lg p-2 hover:bg-colorActive hover:text-tDarkBg font-poppinsBold border-colorActive border-2 font-bold">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;