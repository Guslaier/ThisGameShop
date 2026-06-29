//  ฟังก์ชัน Global fetch handler
window.fetch = (async (originalFetch => {
  return async (...args) => {
    const response = await originalFetch(...args);

    if (response.status === 403) {
      let data = {};
      try {
        data = await response.clone().json();
      } catch (e) {}

      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: data.message || 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
        background: '#1e1e1e',
        color: '#fff'
      });

      return response; // ยังคงส่ง response กลับให้โค้ดอื่นทำงานต่อได้
    }

    return response;
  };
})(window.fetch));