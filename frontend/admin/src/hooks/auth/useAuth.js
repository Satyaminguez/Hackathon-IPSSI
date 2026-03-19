import { useEffect, useState } from "react";
import UserServices from "../../services/UserServices";

export function useRegisterUser(data) {
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // const userServices = new UserServices();
        console.log(data);
    
        // userServices.register()
        //     .then((resolve) => {
        //         console.log(resolve);
        //         // setLoading(false);
        //         // setDatas(resolve.results);
        //         // console.log(resolve);
        //     })
        //     .catch((error) => {
        //         // setLoading(true);
        //         // setError(false);
        //         console.log("Une erreur spéciale", error);
        //     });
    }, []);

    return {datas, loading, error};
}
