import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleLogin() {
    const [userInfo, setUserInfo] = useState(null);

    // Define o ambiente (true pra local, false pra Azure)
    const isLocal = process.env.NODE_ENV === 'development';

    // IP local dinâmico - muda aqui pro IP atual (casa, faculdade ou amigo)
    const localIp = "10.0.0.191: 8080"; // Exemplo: casa. Muda pra "10.105.81.174" na faculdade, ou pede pro amigo mudar.

    const azureUrl = "https://calygamb-dmdzafhbf4aaf6bp.brazilsouth-01.azurewebsites.net";

    const googleAuthUrl = isLocal ? `http://${localIp}:8080/auth/google` : `${azureUrl}/auth/google`;
    const redirectUri = isLocal ? `http://${localIp}:8080/auth/google/callback` : `${azureUrl}/auth/google/callback`;

    const goToGoogle = async () => {
        try {
            const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);

            if (result.type === "success" && result.url) {
                const urlParams = new URLSearchParams(result.url.split("?")[1]);
                const jwtToken = urlParams.get("token");
                if (jwtToken) {
                    await AsyncStorage.setItem("token", jwtToken);
                    setUserInfo({ jwtToken });
                    alert("Login bem-sucedido!");
                } else {
                    alert("Erro: Token não encontrado");
                }
            } else if (result.type === "dismiss") {
                alert("Login cancelado");
            } else if (result.type === "error") {
                alert("Erro na autenticação");
            }
        } catch (error) {
            alert("Erro ao iniciar login");
        }
    };

    return { userInfo, goToGoogle };
}