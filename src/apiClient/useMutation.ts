import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const EXPRESS_URL = process.env.REACT_APP_EXPRESS_URL || "";

const useMutation = ({ mutation }: { mutation: string }) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const token = useSelector((state: RootState) => state.login.token);

    const mutate = async (variables?: Record<string, any>, bToken?: string) => {
        console.log("Mutating with token:", bToken || token);
        setLoading(true);
        try {
            const response = await fetch(EXPRESS_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token || bToken}`,
                    "Content-Type": "application/json",
                    "x-hasura-admin-secret": "your_hasura_admin_secret",
                },
                body: JSON.stringify({
                    query: mutation,
                    variables,
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors.map((err: { message: any }) => err.message).join(", "));
            }

            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { data, error, loading, mutate };
};

export default useMutation;