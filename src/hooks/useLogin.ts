import { useEffect, useState } from 'react';
import supabase from '../supabase/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { authenticate, unauthenticate } from '../redux/loginSlice';

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated)
    const disptach = useDispatch();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_, session) => {
            if (session) {
                disptach(authenticate({
                    user: session?.user.email || '',
                    token: session?.access_token || ''
                }))
            } else {
                disptach(unauthenticate())
            }
        })
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log(error)

            if (error) {
                throw error;
            }

            disptach(authenticate({
                user: email,
                token: data.session.access_token
            }))

            return true; // Login successful
        } catch (err: any) {
            setError(err.message);
            return false; // Login failed
        } finally {
            setLoading(false);
        }
    };


    const logout = async () => {
        console.log("SIGING OUT")
        supabase.auth.signOut();
    }



    return { login, logout, isAuthenticated, loading, error };
};

export default useLogin;
