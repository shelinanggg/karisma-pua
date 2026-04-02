import { useState } from "react"
import { loginService } from "../services/authService";
import { findUserByNip } from "../../../backend/src/repositories/user.repository";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const login = async (nip:string, password:string) => {
        setLoading(true)
        setError(null)

        try{
            const result = await loginService({nip, password})
            return result
        }
        catch(err:any){
            setError(err.response?.data?.message || "Login Gagal" )
            throw err
        }
        finally{
            setLoading(false)
        }
    }

    return{
        login, loading, error
    }
}