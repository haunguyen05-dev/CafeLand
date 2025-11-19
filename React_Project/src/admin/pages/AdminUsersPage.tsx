// src/admin/pages/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import type { User } from "../types";
import "../../css/admin.css";

const API = "http://localhost:3000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch(`${API}/users/get`);
    const data = await res.json();
    setUsers(data);
  }

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
