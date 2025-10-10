import axiosClient from "@/lib/react-query/axiosClient";

// Causes API endpoints
export const getCauses = async () => {
    const response = await axiosClient.get('/crwd/causes/');
    return response.data;
};

export const createCause = async (data: any) => {
    const response = await axiosClient.post('/crwd/causes/', data);
    return response.data;
};

export const getCauseById = async (id: string) => {
    const response = await axiosClient.get(`/crwd/causes/${id}/`);
    return response.data;
};

export const updateCause = async (id: string, data: any) => {
    const response = await axiosClient.put(`/crwd/causes/${id}/`, data);
    return response.data;
};

export const patchCause = async (id: string, data: any) => {
    const response = await axiosClient.patch(`/crwd/causes/${id}/`, data);
    return response.data;
};

export const deleteCause = async (id: string) => {
    const response = await axiosClient.delete(`/crwd/causes/${id}/`);
    return response.data;
};

// Collectives API endpoints
export const getCollectives = async () => {
    const response = await axiosClient.get('/crwd/collectives/');
    return response.data;
};

export const createCollective = async (data: any) => {
    const response = await axiosClient.post('/crwd/collectives/', data);
    return response.data;
};

export const getCollectiveById = async (id: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/`);
    return response.data;
};

export const updateCollective = async (id: string, data: any) => {
    const response = await axiosClient.put(`/crwd/collectives/${id}/`, data);
    return response.data;
};

export const patchCollective = async (id: string, data: any) => {
    const response = await axiosClient.patch(`/crwd/collectives/${id}/`, data);
    return response.data;
};

export const deleteCollective = async (id: string) => {
    const response = await axiosClient.delete(`/crwd/collectives/${id}/`);
    return response.data;
};

// Collective Causes API endpoints
export const getCollectiveCauses = async (id: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/causes/`);
    return response.data;
};

export const createCollectiveCause = async (id: string, data: any) => {
    const response = await axiosClient.post(`/crwd/collectives/${id}/causes/`, data);
    return response.data;
};

export const getCollectiveCauseById = async (id: string, causePk: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/causes/${causePk}/`);
    return response.data;
};

export const deleteCollectiveCause = async (id: string, causePk: string) => {
    const response = await axiosClient.delete(`/crwd/collectives/${id}/causes/${causePk}/`);
    return response.data;
};

// Collective Actions API endpoints
export const joinCollective = async (id: string) => {
    const response = await axiosClient.post(`/crwd/collectives/${id}/join/`);
    return response.data;
};

export const leaveCollective = async (id: string) => {
    const response = await axiosClient.post(`/crwd/collectives/${id}/leave/`);
    return response.data;
};

// Collective Members API endpoints
export const getCollectiveMembers = async (id: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/members/`);
    return response.data;
};

export const addCollectiveMember = async (id: string, data: any) => {
    const response = await axiosClient.post(`/crwd/collectives/${id}/members/`, data);
    return response.data;
};

export const getCollectiveMemberById = async (id: string, memberPk: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/members/${memberPk}/`);
    return response.data;
};

export const updateCollectiveMember = async (id: string, memberPk: string, data: any) => {
    const response = await axiosClient.put(`/crwd/collectives/${id}/members/${memberPk}/`, data);
    return response.data;
};

export const patchCollectiveMember = async (id: string, memberPk: string, data: any) => {
    const response = await axiosClient.patch(`/crwd/collectives/${id}/members/${memberPk}/`, data);
    return response.data;
};

export const deleteCollectiveMember = async (id: string, memberPk: string) => {
    const response = await axiosClient.delete(`/crwd/collectives/${id}/members/${memberPk}/`);
    return response.data;
};

// Collective Stats API endpoint
export const getCollectiveStats = async (id: string) => {
    const response = await axiosClient.get(`/crwd/collectives/${id}/stats/`);
    return response.data;
};

// User Collectives API endpoint
export const getUserCollectives = async () => {
    const response = await axiosClient.get('/crwd/user/collectives/');
    return response.data;
};