import { makeRedirectUri } from "expo-auth-session";
import { Linking } from "react-native";

const BACKEND_URL = "https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net/auth/google";

export default function useGoogleLogin() {

    const goToGoogle = () => {
        Linking.openURL(BACKEND_URL);
    };

    const redirectUri = makeRedirectUri({
        scheme: "calygam",
    });
    console.log("Redirect URI:", redirectUri);

    return { goToGoogle };
}