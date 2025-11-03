import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUserRole = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const loadRole = async () => {
            const storedRole = await AsyncStorage.getItem("userRole");
            setRole(storedRole);
        };

        loadRole();
    }, []);

    return role;
};

export default useUserRole;
