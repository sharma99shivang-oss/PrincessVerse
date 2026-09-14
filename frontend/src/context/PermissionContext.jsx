import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
const PermissionContext = createContext();

export function PermissionProvider({ children }) {
    const [permissions, setPermissions] = useState({});
    const [modules, setModules] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const loadPermissions = async () => {
        try {
            const { data } = await client.get("/couples/permissions");
            setPermissions(data.permissions || {});
        } catch (err) {
            console.log(err);
            setPermissions({});
        }
    };

    const loadModules = async () => {
        const { data } = await client.get("/couples/modules");
        setModules(data.modules || {});
    };

    useEffect(() => {
        if (!user) {
            setPermissions({});
            setModules({});
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setLoading(true);

            try {
                await Promise.all([loadPermissions(), loadModules()]);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user]);

    return (
        <PermissionContext.Provider
            value={{
                permissions,
                modules,
                loading,
                loadPermissions,
                loadModules,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
}

// Hook LAST me export karo
export function usePermissions() {
    return useContext(PermissionContext);
}