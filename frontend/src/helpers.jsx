import FirstSvg from "@/assets/1st.svg";
import SecondSvg from "@/assets/2nd.svg";
import ThirdSvg from "@/assets/3rd.svg";
import FourthSvg from "@/assets/4th.svg";

const BASE_API_URL = 'http://localhost:6005';
// const BASE_API_URL = 'https://ito-website.onrender.com';

const themeShadows = {
    Light: `
        drop-shadow-[-1px_-1px_0_gray]
        drop-shadow-[1px_-1px_0_gray]
        drop-shadow-[-1px_1px_0_gray]
        drop-shadow-[1px_1px_0_gray]`,

    Dark: `
        drop-shadow-[-1px_-1px_0_black]
        drop-shadow-[1px_-1px_0_black]
        drop-shadow-[-1px_1px_0_black]
        drop-shadow-[1px_1px_0_black]`,

    "Light-Fun": `
        drop-shadow-[-1px_-1px_0_gray]
        drop-shadow-[1px_-1px_0_gray]
        drop-shadow-[-1px_1px_0_gray]
        drop-shadow-[1px_1px_0_gray]`,

    Fire: `
        drop-shadow-[-1px_-1px_0_black]
        drop-shadow-[1px_-1px_0_black]
        drop-shadow-[-1px_1px_0_black]
        drop-shadow-[1px_1px_0_black]`,
    Itt: `
        drop-shadow-[-1px_-1px_0_black]
        drop-shadow-[1px_-1px_0_black]
        drop-shadow-[-1px_1px_0_black]
        drop-shadow-[1px_1px_0_black]`
};

function convertToEmbedUrl(url) {
    // YouTube regex patterns
    const youTubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/;
    const youTubeLongRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

    // Twitch regex patterns
    const twitchVideoRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/(\d+)/;
    const twitchClipRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/\w+\/clip\/([a-zA-Z0-9_-]+)/;
    const twitchClipRegex2 = /(?:https?:\/\/)?clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/;
    const twitchChannelRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_-]+)(?:\/?\?.*)?$/;

    let match;

    // Short YouTube URLs
    match = url.match(youTubeShortRegex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }

    // Long YouTube URLs
    match = url.match(youTubeLongRegex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }

    // Check for Twitch video URLs
    match = url.match(twitchVideoRegex);
    if (match && match[1]) {
        return `https://player.twitch.tv/?video=${match[1]}&parent=${window.location.hostname}`;
    }

    // (format: twitch.tv/username/clip/clipname)
    match = url.match(twitchClipRegex);
    if (match && match[1]) {
        return `https://clips.twitch.tv/embed?clip=${match[1]}&parent=${window.location.hostname}`;
    }

    // (format: clips.twitch.tv/clipname)
    match = url.match(twitchClipRegex2);
    if (match && match[1]) {
        return `https://clips.twitch.tv/embed?clip=${match[1]}&parent=${window.location.hostname}`;
    }

    // Twitch channel/stream URLs
    match = url.match(twitchChannelRegex);
    if (match && match[1]) {
        const excludedPaths = ['videos', 'clips', 'events', 'schedule', 'about'];
        if (!excludedPaths.includes(match[1].toLowerCase())) {
            return `https://player.twitch.tv/?channel=${match[1]}&parent=${window.location.hostname}`;
        }
    }

    return null;
}

const formatCategory = (category) => {
    if (!category) return category;
    if (category === "any%") return "Any%";
    if (category === "inbounds") return "Inbounds";
    return category;
}

const formatChapter = (chapter) => {
    if (!chapter) return chapter;
    if (chapter === "rose's_room" || chapter === "rose's room") return "Rose's Room";
    if (chapter === "snow_globe" || chapter === "snow globe") return "Snow Globe"
    return chapter.charAt(0).toUpperCase() + chapter.slice(1);
}

const formatSubChapter = (chapter) => {
    if (!chapter) return chapter;
    return chapter.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

const getRankDisplay = (rank, height, width, lb_size, text_side) => {

    if(!height) height = 8;
    if(!width) width = 8;
    if(!lb_size) lb_size = "md";
    if(!text_side) text_side = "text-left";

    const className = `h-${height} w-${width}`;


    switch (rank) {
        case 1:
            return <img src={FirstSvg} alt="1st Place" className={className} />;
        case 2:
            return <img src={SecondSvg} alt="2nd Place" className={className} />;
        case 3:
            return <img src={ThirdSvg} alt="3rd Place" className={className} />;
        case 4:
            return <img src={FourthSvg} alt="4th Place" className={className} />;
        default:
        {
            const lastDigit = rank % 10;
            const lastTwoDigits = rank % 100;

            let suffix = 'th';
            if (lastTwoDigits < 11 || lastTwoDigits > 13) {
                if (lastDigit === 1) suffix = 'st';
                else if (lastDigit === 2) suffix = 'nd';
                else if (lastDigit === 3) suffix = 'rd';
            }

            return <span className={`text-tBase font-bold text-${lb_size} pr-4 ${text_side} w-16`}>{rank}{suffix}</span>;
        }
    }
};

const getDaysAgo = (timestamp) => {
    const runDate = new Date(timestamp * 1000);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - runDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        if (months === 1) {
            return "1 month ago";
        } else {
            return `${months} months ago`;
        }
    } else {
        const years = Math.floor(diffDays / 365);
        if (years === 1) {
            return "1 year ago";
        } else {
            return `${years} years ago`;
        }
    }
};

const convertUnixToDateInput = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const navigateToLeaderboardWithRefresh = (run, onClose = null) => {
    if (onClose) {
        onClose();
    }

    const params = new URLSearchParams();
    params.set('view', 'category');
    params.set('game', 'itt');

    if (run.category) {
        params.set('runCategory', formatCategory(run.category));
    }

    if (run.chapter) {
        params.set('chapter', formatChapter(run.chapter));
    }

    if (run.sub_chapter) {
        params.set('subChapter', formatSubChapter(run.sub_chapter));
    }

    window.location.href = `/itt?${params.toString()}`;
};

export{
    convertToEmbedUrl,
    formatCategory,
    formatChapter,
    formatSubChapter,
    getRankDisplay,
    getDaysAgo,
    convertUnixToDateInput,
    navigateToLeaderboardWithRefresh,
    themeShadows,
    BASE_API_URL
};