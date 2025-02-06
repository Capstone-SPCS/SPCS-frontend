import { useEffect, useState } from 'react';
import supabase from '../supabase/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { authenticate, unauthenticate } from '../redux/loginSlice';
import { useGetOperator } from '../apiClient/useOperator';

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [pendingAuth, setPendingAuth] = useState<{
        user: string;
        token: string;
    } | null>(null);

    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const dispatch = useDispatch();
    const { operator, fetchOperator } = useGetOperator();

    // Watch for operator changes and complete the authentication
    useEffect(() => {
        if (operator && pendingAuth) {
            setRole(operator.role);
            dispatch(authenticate({
                user: pendingAuth.user,
                token: pendingAuth.token,
                role: operator.role || ''
            }));
            setPendingAuth(null);
        }
    }, [operator, pendingAuth, dispatch]);

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (_, session) => {
            if (session) {
                await fetchOperator(session.user.id, session.access_token);
                setPendingAuth({
                    user: session.user.email || '',
                    token: session.access_token || ''
                });
            } else {
                dispatch(unauthenticate());
            }
        });
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            await fetchOperator(data.user.id, data.session.access_token);
            setPendingAuth({
                user: email,
                token: data.session.access_token
            });

            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        supabase.auth.signOut();
    };

    return { login, logout, isAuthenticated, role, loading, error };
};

export default useLogin;