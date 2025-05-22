import { useState } from "react";
import { User } from "../../../api/user";

type UpdateAccountProps = {
    account: User;
    onUpdate: (id: string, update: UpdateAccountType) => void;
    onDelete: () => void;
};

export type UpdateAccountType = {
    name: string;
    lastname: string;
    address: string;
    phone: string;
};

export function UpdateAccount({ account, onUpdate, onDelete }: UpdateAccountProps) {
    if(!account){
        return <p>User is null</p>
    }
    const [name, setName] = useState(account.name || "");
    const [lastname, setLastname] = useState(account.lastname || "");
    const [phone, setPhone] = useState(account.phone || "");
    const [address, setAddress] = useState(account.address || "");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onUpdate(account!._id, { name, lastname, phone, address });
    }

    return (
        <div>
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
