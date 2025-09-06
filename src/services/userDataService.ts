import { getMe } from "./api";

class UserDataService {
    private static instance: UserDataService;
    private userDataPromise: Promise<any> | null = null;
    private userData: any = null;
    private isFetching: boolean = false;

    public static getInstance(): UserDataService {
        if (!UserDataService.instance) {
            UserDataService.instance = new UserDataService();
        }
        return UserDataService.instance;
    }

    // Get User Data
    public async getUserData(): Promise<any> {
        // If we already have the data, return it immediately
        if (this.userData) {
            return this.userData;
        }

        // SYNCHRONOUS check and flag setting to prevent race conditions
        if (this.isFetching) {
            if (this.userDataPromise) {
                try {
                    return await this.userDataPromise;
                } catch (error) {
                    this.userDataPromise = null;
                    this.isFetching = false;
                }
            }
        }

        this.isFetching = true;
        this.userDataPromise = this._fetchUserData();
        try {
            this.userData = await this.userDataPromise;
            return this.userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    private async _fetchUserData(): Promise<any> {
        try {
            return await getMe();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        } finally {
            this.isFetching = false;
            this.userDataPromise = null;
        }
    }
}

export default UserDataService;