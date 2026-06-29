// ============================================================
//  FILE: /public/javascripts/admin/ad-users.js
// ระบบจัดการผู้ใช้ (Admin User Management)
// ============================================================

const apiBase = '/account/list';
const userTableBody = document.getElementById('userTableBody');

//  โหลดข้อมูลผู้ใช้ทั้งหมด
async function loadUsers() {
  try {
    const res = await fetch(apiBase);
    const data = await res.json();
    console.log(data)
    if (!data.status || !Array.isArray(data.data) || data.data.length === 0) {
      userTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#999;">No users found</td></tr>`;
      return;
    }

    renderUsers(data.data);
  } catch (err) {
    console.error("Error loading users:", err);
    userTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Failed to load users</td></tr>`;
  }
}

//  แสดงผลในตาราง
function renderUsers(users) {
  userTableBody.innerHTML = users.map((u, i) => {
    const isRoot = (u.id === 1 || u.email === 'root@thisgameshop.com' || u.role === 'root');

    return  `
      <div class="user-card">
        <div class="user-left">
          <div class="user-number">#${i + 1}</div>
          <div class="user-name">${u.display_name || '-'}</div>
          <div class="user-email">${u.email}</div>
          <div class="user-role"> ${u.role || 'user'}</div>
          <div class="user-date"> ${new Date(u.created_at).toLocaleDateString()}</div>
        </div>
        
        <div class="user-status">
          ${isRoot
            ? `<span class="status-label active"> Root Admin</span>`
            : `
              <span class="status-label ${u.is_active ? 'active' : 'inactive'}">
                ${u.is_active ? ' Active' : ' Inactive'}
              </span>
              <button class="btn-small status-toggle"
                onclick="toggleUserStatus(${u.id}, ${u.is_active})">
                ${u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            `
          }
        </div>

        <div class="user-actions">
          ${isRoot
            ? `<button class="btn-small" disabled title="Cannot modify Root Admin">Locked </button>`
            : `
              <button class="btn-small edit" onclick="editUser(${u.id})">Edit Name</button>
              <button class="btn-small info" onclick="editRole(${u.id}, '${u.role}')">Edit Role</button>
              <button class="btn-small danger" onclick="deleteUser(${u.id}, '${u.email}')">Delete</button>
            `
          }
        </div>
      </div>
    `;
  }).join('');
}
async function editRole(id, currentRole) {
  //  ป้องกัน root admin
  if (id === 1) {
    Swal.fire({
      icon: "warning",
      title: "ไม่สามารถแก้ Role ของ Root Admin ได้ ",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  const { value: role } = await Swal.fire({
    title: " เปลี่ยนบทบาทผู้ใช้",
    input: "select",
    inputOptions: {
      admin: "Admin",
      staff: "Staff",
      user: "User",
    },
    inputValue: currentRole || "user",
    showCancelButton: true,
    confirmButtonText: "Save",
    inputPlaceholder: "เลือกบทบาทใหม่"
  });

  if (role) {
    try {
      const res = await fetch(`../account/update-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role })
      });

      const data = await res.json();

      if (res.ok && data.status) {
        Swal.fire(" สำเร็จ!", `เปลี่ยนบทบาทผู้ใช้เป็น ${role} แล้ว`, "success");
        loadUsers();
      } else {
        Swal.fire(" Error", data.message || "อัปเดตไม่สำเร็จ", "error");
      }
    } catch (err) {
      console.error("Edit role error:", err);
      Swal.fire(" Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
  }
}

//  ฟิลเตอร์
document.getElementById('filterName').addEventListener('input', applyFilters);
document.getElementById('filterRole').addEventListener('change', applyFilters);
document.getElementById('filterStatus').addEventListener('change', applyFilters);

function applyFilters() {
  const name = document.getElementById('filterName').value.toLowerCase();
  const role = document.getElementById('filterRole').value.toLowerCase();
  const status = document.getElementById('filterStatus').value.toLowerCase();

  //  ค้นหาจากการ์ดแทนที่จะเป็นแถว
  const cards = Array.from(document.querySelectorAll('.user-card'));

  cards.forEach(card => {
    const nameText = card.querySelector('.user-name')?.innerText.toLowerCase() || '';
    const emailText = card.querySelector('.user-email')?.innerText.toLowerCase() || '';
    const roleText = card.querySelector('.user-role')?.innerText.toLowerCase() || '';
    const statusText = card.querySelector('.user-status')?.innerText.toLowerCase() || '';

    //  ให้ค้นจากทั้งชื่อและอีเมล
    const matchName = !name || nameText.includes(name) || emailText.includes(name);
    const matchRole = !role || roleText.includes(role);
    const matchStatus = !status ||
      (status === 'active' ? statusText.includes('active') : statusText.includes('inactive'));

    card.style.display = (matchName && matchRole && matchStatus) ? '' : 'none';
  });
}


document.getElementById("btnAddUser").addEventListener("click", async () => {
  const { value: formValues } = await Swal.fire({title: " Add New User",
    html: `
      <input id="swal-email" class="swal2-input" placeholder="Email" type="email">
      <input id="swal-pass" class="swal2-input" placeholder="Password" type="text" minlength="8">
      <input id="swal-name" class="swal2-input" placeholder="Display name" type="text">
      <select id="swal-role" class="swal2-input">
        <option value="user">User</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>
    `,
    focusConfirm: false,
    confirmButtonText: "Create User",
    showCancelButton: true,
    preConfirm: () => {
      const email = document.getElementById("swal-email").value.trim();
      const password = document.getElementById("swal-pass").value.trim();
      const display_name = document.getElementById("swal-name").value.trim();
      const role = document.getElementById("swal-role").value;

      if (!email || !password || !display_name) {
        Swal.showValidationMessage("️ โปรดกรอกข้อมูลให้ครบทุกช่อง");
        return false;
      }

      if (password.length < 6) {
        Swal.showValidationMessage(" รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return false;
      }

      return { email, password, display_name, role };
    },
icon: 'warning'});

  if (formValues) {
    try {
      const res = await fetch("../account/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      const data = await res.json();

      if (res.ok && data.status) {
        Swal.fire(" Success", "เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว", "success");
        loadUsers();
      } else {
        Swal.fire(" Error", data.message || "ไม่สามารถเพิ่มผู้ใช้ได้", "error");
      }
    } catch (err) {
      console.error("Add user error:", err);
      Swal.fire(" Error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  }
});

//  แก้ไขผู้ใช้
function editUser(id) {
  Swal.fire({
    title: " Edit User",
    input: 'text',
    inputLabel: 'New display name',
    inputPlaceholder: 'Enter new name...',
    showCancelButton: true,
    confirmButtonText: 'Save',
  }).then(async result => {
    if (result.isConfirmed && result.value) {
      await fetch(`../account/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"id": id ,display_name: result.value })
      });
      Swal.fire(' Updated!', 'User name updated successfully.', 'success');
      loadUsers();
    }
  });
}

//  ลบผู้ใช้
// ============================================================
// ️ ลบผู้ใช้ (กัน root admin)
// ============================================================
async function deleteUser(id, email) {
  if (id === 1 || email === 'root@thisgameshop.com') {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถลบ Root Admin ได้ ',
      text: 'บัญชีนี้เป็นผู้ดูแลหลักของระบบ',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const confirm = await Swal.fire({
    title: " ลบผู้ใช้?",
    text: "การลบนี้ไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33"
  });
  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`/account/delete/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.status) {
      Swal.fire("Deleted!", "User has been removed.", "success");
      loadUsers();
    } else {
      Swal.fire("Error", data.message || "Failed to delete user.", "error");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    Swal.fire("Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
  }
}

// ============================================================
//  Toggle User Status (Active / Inactive)
// ============================================================
async function toggleUserStatus(userId, currentStatus) {
  //  ดึงข้อมูลผู้ใช้จากตาราง (เพื่อดูว่าเป็น root ไหม)
  const row = document.querySelector(`button[onclick="toggleUserStatus(${userId}, ${currentStatus})"]`)?.closest('tr');
  const email = row ? row.children[2].innerText.toLowerCase() : '';

  //  ป้องกัน root admin (เช่น ID = 1 หรือ email ที่กำหนด)
  if (userId === 1 || email === 'root@thisgameshop.com') {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่สามารถปิดสถานะ Root Admin ได้ ',
      text: 'บัญชีนี้เป็นผู้ดูแลหลักของระบบ',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const newStatus = !currentStatus;
  const action = newStatus ? "เปิดการใช้งาน" : "ปิดการใช้งาน";

  const confirm = await Swal.fire({
    title: `${action} ผู้ใช้?`,
    text: `คุณแน่ใจหรือไม่ว่าต้องการ${action}บัญชีนี้?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: newStatus ? "#28a745" : "#d33",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`../account/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: newStatus })
    });

    const data = await res.json();

    if (res.ok && data.status) {
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: `สถานะผู้ใช้ถูก${action}เรียบร้อยแล้ว`,
        timer: 1200,
        showConfirmButton: false
      });
      loadUsers();
    } else {
      Swal.fire(" Error", data.message || "ไม่สามารถอัปเดตสถานะได้", "error");
    }

  } catch (err) {
    console.error("Toggle status error:", err);
    Swal.fire(" Error", "เกิดข้อผิดพลาดระหว่างเชื่อมต่อเซิร์ฟเวอร์", "error");
  }
}

loadUsers();
