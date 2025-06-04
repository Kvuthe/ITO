import { createContext, useContext } from 'react';
import ApiClient from '../ApiClient';
import { useCookies} from "react-cookie";

const ApiContext = createContext();

export default function ApiProvider({ children }) {
    const [cookies, setCookie] = useCookies(["refresh_token"]);

    const api = new ApiClient((error) => {
        console.error(error);
    }, setCookie, cookies);

    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
}

export function useApi() {
    return useContext(ApiContext);
}