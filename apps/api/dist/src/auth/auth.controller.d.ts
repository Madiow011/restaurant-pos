import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
