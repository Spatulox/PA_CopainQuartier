import { useEffect, useState } from "react";
import { User } from "../../../api/user";

type UpdateAccountProps = {
    account: User;
    APIerror: any
    onUpdate: (id: string, update: UpdateAccountType) => void;
    onDelete: () => void;
};

export type UpdateAccountType = {
    name: string;
    lastname: string;
    address: string;
    phone: string;
};

export function UpdateAccount({ account, APIerror, onUpdate, onDelete }: UpdateAccountProps) {
    if(!account){
        return <p>User is null</p>
    }
    const [name, setName] = useState(account.name || "");
    const [lastname, setLastname] = useState(account.lastname || "");
    const [phone, setPhone] = useState(account.phone || "");
    const [address, setAddress] = useState(account.address || "");
    const [err, setError] = useState<string[]>()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onUpdate(account!._id, { name, lastname, phone, address });
    }

    useEffect(() => {
        if(APIerror){
            const errTMP: string[] = []
            for (const err in APIerror){
                errTMP.push(`${err} : ${APIerror[err]}`)
            }
            if(errTMP.length > 0){
                setError(errTMP)
            }
        } else {
            setError([])
        }
    }, [APIerror])

    return (
        <div>
            {err && err.length > 0 && <>
            <div className="error-messages">
                {err && err.length > 0 && err.map((e: any) => (
                   <p>{e}</p>
                ))}
            </div>
            </>}
            <h2>Modifier mon compte</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Prénom :
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Nom :
                        <input
                            type="text"
                            value={lastname}
                            onChange={e => setLastname(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Téléphone :
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Adresse :
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Email : <span>{account.email}</span>
                    </label>
                </div>
                <div>
                    <button type="submit">Mettre à jour</button>
                    <button type="button" onClick={() => onDelete()}>Supprimer le compte</button>
                </div>
            </form>
        </div>
    );
}
