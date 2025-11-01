import axiosClient from "@/lib/react-query/axiosClient";

// Donation Box API endpoints
export const getDonationAllocations = async () => {
    const response = await axiosClient.get('/donations/allocations/');
    return response.data;
};

export const getDonationBox = async () => {
    const response = await axiosClient.get('/donations/box/');
    return response.data;
};

export const activateDonationBox = async () => {
    const response = await axiosClient.post('/donations/box/activate/');
    return response.data;
};

export const activateDonationBoxMobile = async () => {
    const response = await axiosClient.post('/donations/box/activate/mobile/');
    return response.data;
};

export const confirmMobileActivation = async (data: any) => {
    const response = await axiosClient.post('/donations/box/activate/mobile/confirm/', data);
    return response.data;
};

export const addCausesToBox = async (data: any) => {
    const response = await axiosClient.post('/donations/box/add-causes/', data);
    return response.data;
};

export const cancelDonationBox = async () => {
    const response = await axiosClient.post('/donations/box/cancel/');
    return response.data;
};

export const updateDonationBox = async (data: any) => {
    const response = await axiosClient.put('/donations/box/update/', data);
    return response.data;
};

export const createDonationBox = async (data: any) => {
    const response = await axiosClient.post('/donations/box/create/', data);
    return response.data;
};

export const removeCauseFromBox = async (causeId: string) => {
    const response = await axiosClient.delete(`/donations/box/remove-cause/${causeId}/`);
    return response.data;
};

export const removeCollectiveFromBox = async (collectiveId: string) => {
    const response = await axiosClient.delete(`/donations/box/remove-collective/${collectiveId}/`);
    return response.data;
};

export const updateDonationBoxAmount = async (data: any) => {
    const response = await axiosClient.put('/donations/box/update-amount/', data);
    return response.data;
};

// General Donation API endpoints
export const getCancelDonation = async () => {
    const response = await axiosClient.get('/donations/cancel/');
    return response.data;
};

export const getDonationHistory = async () => {
    const response = await axiosClient.get('/donations/history/');
    return response.data;
};

export const createOneTimeDonation = async (data: any) => {
    const response = await axiosClient.post('/donations/one-time/', data);
    return response.data;
};

export const createOneTimeDonationMobile = async (data: any) => {
    const response = await axiosClient.post('/donations/one-time/mobile/', data);
    return response.data;
};

export const getDonationSuccess = async () => {
    const response = await axiosClient.get('/donations/success/');
    return response.data;
};

export const processDonationWebhook = async (data: any) => {
    const response = await axiosClient.post('/donations/webhook/', data);
    return response.data;
};
