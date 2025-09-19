import api from "@/lib/api-client";
import { UserDTO, UserForm } from "@/models/user/userDTO";

export const getUsers = async (token: string, userId: string) : Promise<UserDTO> => {
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

export const createUser = async( data: UserForm) => {
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

export const updateUser = async (token: string, userId: string, data: UserForm) => {
  try {
    const response = await api.put(
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