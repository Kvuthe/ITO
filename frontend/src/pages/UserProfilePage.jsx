import ProfileGrid from '../components/ProfileGrid.jsx';
import {useParams} from "react-router-dom";

const UserProfilePage = ({ showUsernameColor }) => {
    const { username } = useParams();

    return(
        <div className="bg-bgPrimary min-h-screen">
            <ProfileGrid username={username} showUsernameColor={showUsernameColor}></ProfileGrid>
        </div>
    );
};

export default UserProfilePage;