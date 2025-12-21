import { UserDTO } from "@/models/user/userDTO";

export function getFullName(u: UserDTO) {
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
}

export function formatDateVN(d: Date) {
  return new Date(d).toLocaleDateString('vi-VN');
}
