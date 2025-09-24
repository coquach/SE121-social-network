import api from "@/lib/api-client";
import { UserDTO, UserCreateForm, ProfileUpdateForm } from "@/models/user/userDTO";

export const getUser = async (token: string, userId: string) : Promise<UserDTO> => {
  try {
    const response = await api.get<UserDTO>(
      `/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data 
  } catch (error) {
    console.error(error);
    throw error;
  }

}

export const createUser = async( data: UserCreateForm) => {
  try {
    const response = await api.post(
      `/users`,
      data
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const updateUser = async (token: string, data: ProfileUpdateForm) => {
  try {
    const response = await api.patch(
      `/users`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}