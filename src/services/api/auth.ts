import axiosClient from "@/lib/react-query/axiosClient";

export const login = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/auth/', data);
    return response.data;
};

export const emailRegistration = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/register/', data);
    return response.data;
};

export const emailVerification = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/confirm/', data);
    return response.data;
};

export const resendEmailVerificationCode = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/resend-confirmation/', data);
    return response.data;
};

export const googleLogin = async (data: any, platform: 'Google' | 'SignInWithApple') => {
    const response = await axiosClient.get(`/auth/google/login/?platform=${platform}`, data);
    return response.data;
};

export const googleCallback = async (code: any, platform: 'google' | 'apple') => {
    console.log("ghghhg", code, platform);
    const response = await axiosClient.get(`/auth/google/callback/?code=${code}&platform=${platform}`);
    return response.data;
};

export const logout = async () => {
    const response = await axiosClient.post('/auth/cognito/logout/');
    return response.data;
};

export const refreshToken = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/refresh/', data);
    return response.data;
};

export const forgotPassword = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/forgot-password/', data);
    return response.data;
};

export const resetPassword = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/reset-password/', data);
    return response.data;
};

export const changePassword = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/change-password/', data);
    return response.data;
};

export const updateEmail = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/update-email/', data);
    return response.data;
};

export const updateEmailVerification = async (data: any) => {
    const response = await axiosClient.post('/auth/cognito/verify-email/', data);
    return response.data;
};

export const getProfile = async () => {
    const response = await axiosClient.get('/auth/me/');
    return response.data;
};

export const getUserByUsername = async (username: string) => {
    const encodedUsername = encodeURIComponent(username);
    const response = await axiosClient.get(`/auth/users/by-username/${encodedUsername}/`);
    return response.data;
};

export const updateProfile = async (data: any) => {
    const response = await axiosClient.patch('/auth/me/update/', data);
    return response.data;
};



//  waitlist
export const joinWaitlist = async (data: any) => {
    const response = await axiosClient.post('/auth/waitlist/join/', data);
    return response.data;
};
