  import React from 'react';

  export default function AdminDashboard({ onChangePage }) {
    // Dữ liệu giả lập để hiển thị thống kê tổng quan của PVI
    const stats = [
      { id: 1, name: 'Tổng số Đối tác', value: '12 đối tác', icon: '👥', color: '#3b82f6' },
      { id: 2, name: 'API Requests (24h)', value: '145,230', icon: '⚡', color: '#10b981' },
      { id: 3, name: 'Tỷ lệ bóc tách thành công', value: '98.4%', icon: '📊', color: '#8b5cf6' },
      { id: 4, name: 'Hệ thống UAT', value: 'Ổn định', icon: '🟢', color: '#f59e0b' },
    ];

    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* SIDEBAR MENU BÊN TRÁI */}
        <div style={{ width: '260px', backgroundColor: '#0f172a', color: '#ffffff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '0 12px 20px 12px', borderBottom: '1px solid #334155', marginBottom: '20px', color: '#38bdf8' }}>
            ⭐ PVI ADMIN PANEL
          </div>
          <button style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
            📊 Quản lý chung (Dashboard)
          </button>
        </div>

        {/* NỘI DUNG CHÍNH CỦA TRANG QUẢN LÝ CHUNG */}
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>Bảng Điều Khiển Tổng Quan</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Hệ thống giám sát hiệu năng tích hợp đối tác Bảo hiểm PVI</p>
            </div>
            <div style={{ fontSize: '14px', color: '#334155', fontWeight: 500, backgroundColor: '#e2e8f0', padding: '8px 16px', borderRadius: '20px' }}>
              Xin chào, admin@pvi.com.vn
            </div>
          </div>

          {/* CÁC KHỐI THÔNG KÊ THỐNG KÊ NHANH (CARDS) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {stats.map((stat) => (
              <div key={stat.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '8px' }}>{stat.name}</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</span>
                </div>
                <div style={{ fontSize: '28px', backgroundColor: `${stat.color}15`, padding: '12px', borderRadius: '12px' }}>{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* DANH SÁCH ĐỐI TÁC MỚI HOẠT ĐỘNG */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b' }}>🤝 Đối tác kết nối gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                <div><strong>Ví điện tử MoMo</strong> <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>• Vừa gọi API /v1/create-order</span></div>
                <span style={{ color: '#10b981', fontWeight: 500, fontSize: '14px' }}>Thành công 200 OK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                <div><strong>Hệ thống VIFO</strong> <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>• 2 phút trước gọi API /v1/calculate-premium</span></div>
                <span style={{ color: '#10b981', fontWeight: 500, fontSize: '14px' }}>Thành công 200 OK</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }