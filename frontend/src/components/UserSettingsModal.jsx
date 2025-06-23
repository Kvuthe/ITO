import { useState, useEffect, useRef } from "react";
import 'flag-icons/css/flag-icons.min.css';

const UserSettingsModal = ({ isOpen, onClose, user, onSave }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [selectedFlag, setSelectedFlag] = useState(user?.flag || '');
    const [usernameColor, setUsernameColor] = useState(user?.username_color || '#000000');
    const [categories, setCategories] = useState({
        anyPercent: user?.categories?.includes('Any%') || false,
        inBounds: user?.categories?.includes('In Bounds') || false,
    });
    const [isFlagPickerOpen, setIsFlagPickerOpen] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const errorRef = useRef(null);

    const initialUserData = {
        username: user?.username || '',
        flag: user?.flag || '',
        username_color: user?.username_color || '#000000',
        categories: {
            anyPercent: user?.categories?.includes('Any%') || false,
            inBounds: user?.categories?.includes('In Bounds') || false,
        },
    };

    useEffect(() => {

        if (isOpen){
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        if (user) {
            setUsername(user.username || '');
            setSelectedFlag(user.flag || '');
            setUsernameColor(user.username_color || '#000000');
            setCategories({
                anyPercent: user?.categories?.includes('Any%') || false,
                inBounds: user?.categories?.includes('In Bounds') || false,
            });
        }
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setError('');

        return () => {
            document.body.style.overflow = 'unset';
        };

    }, [user, isOpen]);

    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [error]);

    const flags = [
        'us', 'ca', 'mx', 'gl', 'bm', 'gt', 'hn', 'sv', 'ni', 'cr',
        'pa', 'cu', 'do', 'ht', 'jm', 'pr', 'tt', 'ar', 'bo', 'br',
        'cl', 'co', 'ec', 'fk', 'gf', 'gy', 'pe', 'py', 'sr', 'uy',
        've', 'al', 'ad', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cy',
        'cz', 'dk', 'ee', 'fo', 'fi', 'fr', 'de', 'gi', 'gr', 'hu',
        'is', 'ie', 'it', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md',
        'mc', 'me', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sm', 'rs',
        'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va', 'ye', 'jp',
        'kr', 'cn', 'in', 'au', 'nz'
    ];

    const handleCategoryChange = (e) => {
        const { name, checked } = e.target;
        setCategories((prev) => ({ ...prev, [name]: checked }));
    };

    const validatePasswords = () => {
        if (password && password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSave = async () => {
        if (password && !validatePasswords()) {
            return;
        }

        setError('');
        setIsSaving(true);

        const updatedData = {};

        if (username !== initialUserData.username) {
            updatedData.username = username;
        }

        if (password) {
            updatedData.password = password;
        }

        if (selectedFlag !== initialUserData.flag) {
            updatedData.flag = selectedFlag;
        }

        if (usernameColor !== initialUserData.username_color) {
            updatedData.username_color = usernameColor;
        }

        const selectedCategories = [];
        if (categories.anyPercent) selectedCategories.push('Any%');
        if (categories.inBounds) selectedCategories.push('In Bounds');

        if (selectedCategories.length > 0) {
            updatedData.categories = selectedCategories;
        }

        if (Object.keys(updatedData).length > 0) {
            try {
                await onSave(updatedData);
            } catch (error) {
                setError(error.message || 'An error occurred while saving your settings. Please try again.');
            }
        }

        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div
                className="bg-fgPrimary rounded-lg w-full max-w-md flex flex-col relative z-10 max-h-[800px] overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-2 right-2 z-60">
                    <button
                        onClick={onClose}
                        className="text-tBase hover:text-colorActive transition-colors rounded-full p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="p-6 pt-10">
                    <h2 className="text-2xl text-center text-tBase font-poppins mb-6">Edit Profile</h2>

                    {/* Error Message */}
                    {error && (
                        <div
                            ref={errorRef}
                            className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative"
                        >
                            {error}
                        </div>
                    )}

                    <input type="text" name="fakeUsername" autoComplete="off" style={{display: 'none'}}/>
                    <input type="password" name="fakePassword" autoComplete="off" style={{display: 'none'}}/>

                    <div className="space-y-6">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-2 text-tBase rounded bg-fgThird border-0"
                                autoComplete="off"
                            />
                        </div>

                        {/* Username Color Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Username Color</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={usernameColor}
                                    onChange={(e) => setUsernameColor(e.target.value)}
                                    className="w-12 h-12 p-0 border-0 bg-transparent cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={usernameColor}
                                    onChange={(e) => setUsernameColor(e.target.value)}
                                    className="flex-1 p-2 text-tBase rounded bg-fgThird border-0"
                                    placeholder="Enter hex color (e.g., #FF0000)"
                                />
                            </div>
                            <div
                                className="mt-2 p-2 rounded font-poppins text-lg"
                                style={{
                                    color: usernameColor,
                                }}
                            >
                                {username}
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Change Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 text-tBase rounded bg-fgThird border-0"
                                autoComplete="off"
                            />
                        </div>

                        {/* Confirm Password Input */}
                        {password && (
                            <div className="space-y-2">
                                <label className="text-sm text-tBase font-poppins">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (passwordError) validatePasswords();
                                    }}
                                    className={`w-full p-2 text-tBase rounded bg-fgThird border-0 ${
                                        passwordError ? 'border border-red-500' : ''
                                    }`}
                                    autoComplete="off"
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm">{passwordError}</p>
                                )}
                            </div>
                        )}

                        {/* Flag Picker */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins"></label>
                            <button
                                className={`fi fi-${selectedFlag} rounded hover:opacity-80 transition-opacity p-2`}
                                onClick={() => setIsFlagPickerOpen(!isFlagPickerOpen)}
                                title={selectedFlag.toUpperCase()}
                            />
                            {isFlagPickerOpen && (
                                <div className="mt-2 grid grid-cols-5 gap-2">
                                    {flags.map((flag) => (
                                        <button
                                            key={flag}
                                            className={`fi fi-${flag} rounded hover:opacity-80 transition-opacity ${
                                                selectedFlag === flag ? 'border-2 border-tBase' : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedFlag(flag);
                                                setIsFlagPickerOpen(false);
                                            }}
                                            title={flag.toUpperCase()}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Preferences */}
                        <div className="space-y-2">
                            <label className="text-sm text-tBase font-poppins">Categories</label>
                            <div className="space-y-2">
                                <label className="flex items-center font-poppins text-tBase">
                                    <input
                                        type="checkbox"
                                        name="anyPercent"
                                        checked={categories.anyPercent}
                                        onChange={handleCategoryChange}
                                        className="mr-2"
                                    />
                                    Any%
                                </label>
                                <label className="flex items-center font-poppins text-tBase">
                                    <input
                                        type="checkbox"
                                        name="inBounds"
                                        checked={categories.inBounds}
                                        onChange={handleCategoryChange}
                                        className="mr-2"
                                    />
                                    In Bounds
                                </label>
                            </div>
                        </div>

                        {/* Save and Cancel Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                onClick={onClose}
                                className="w-1/2 bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg p-2 rounded"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-1/2 bg-colorActive text-tActive hover:bg-fgSecondary hover:text-tDarkBg font-poppins p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;