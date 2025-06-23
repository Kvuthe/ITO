import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {useEffect, useState} from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import './App.css';
import './index.css';
import './styles/globals.css';

import LoginPage from './pages/LoginPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import SubmissionPage from './pages/SubmissionPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MainPage from './pages/MainPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ModPage from './pages/ModPage.jsx';

import UserProvider from './contexts/UserProvider.jsx';
import FlashProvider from './contexts/FlashProvider.jsx';
import ApiProvider from './contexts/ApiProvider.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Navbar from './components/NavigationBar.jsx';
import Footer from './components/Footer.jsx';
import 'typeface-poppins'
import SubmissionModPage from "./pages/SubmissionModPage.jsx";
import LeaguePage from "./pages/LeaguePage.jsx";
import LeagueSubmissionPage from "./pages/LeagueSubmissionPage.jsx";
import BracketPage from "./pages/BracketPage.jsx";

const themes = ["Dark", "Light", "Light-Fun", "Fire", "Itt"];

function App() {
    const [cookies, setCookie] = useCookies(["theme", "showUsernameColor"])
    const [theme, setTheme] = useState(cookies.theme || themes[0]);

    const [showUsernameColor, setShowUsernameColor] = useState(cookies.showUsernameColor);

    useEffect(() => {
        setCookie('theme', theme, { path: '/', maxAge: 365 * 24 * 60 * 60 });
    }, [theme, setCookie]);

    useEffect(() => {
        console.log(showUsernameColor);
        setCookie("showUsernameColor", showUsernameColor ? "true" : "false", {
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        });
    }, [showUsernameColor, setCookie]);

    return (
        <BrowserRouter>
            <FlashProvider>
                <ApiProvider>
                    <UserProvider>
                        <div className="min-h-screen flex flex-col">
                            <main className={`theme-${theme} flex-grow`}>
                                <Navbar/>
                                <Routes className="pt-8">
                                    <Route
                                        path="/login"
                                        element={
                                            <PublicRoute>
                                                <LoginPage />
                                            </PublicRoute>
                                        }
                                    />
                                    <Route
                                        path="/register"
                                        element={
                                            <PublicRoute>
                                                <RegisterPage />
                                            </PublicRoute>
                                        }
                                    />

                                    <Route path="/profile/:username" element={<UserProfilePage showUsernameColor={showUsernameColor} />} />

                                    <Route path="/" element={<LandingPage theme={theme} />} />

                                    <Route path="/itt" element={<MainPage theme={theme} showUsernameColor={showUsernameColor} />} />

                                    <Route path="/leagues" element={<LeaguePage theme={theme} showUsernameColor={showUsernameColor} />} />

                                    <Route path="/leagues/submit" element={<LeagueSubmissionPage />} />

                                    <Route path="/leagues/bracket" element={<BracketPage theme={theme} showUsernameColor={showUsernameColor} />} />

                                    <Route
                                        path="/new_submission"
                                        element={
                                            <PrivateRoute>
                                                <SubmissionPage />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/mod_page"
                                        element={
                                            <PrivateRoute>
                                                <ModPage theme={theme} />
                                            </PrivateRoute>
                                        }
                                    />

                                    {/*<Route path="/mod_submission" element={<SubmissionModPage />} />*/}

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                                <Footer
                                    themes={themes}
                                    currentTheme={theme}
                                    setTheme={setTheme}
                                    showUsernameColor={showUsernameColor}
                                    setShowUsernameColor={setShowUsernameColor}
                                />
                            </main>
                        </div>
                    </UserProvider>
                </ApiProvider>
            </FlashProvider>
        </BrowserRouter>
    );
}

export default App;