export declare class AuthService {
    login(pin: string): {
        id: number;
        name: string;
        role: string;
    };
    getUsers(): {
        id: number;
        name: string;
        role: string;
    }[];
}
