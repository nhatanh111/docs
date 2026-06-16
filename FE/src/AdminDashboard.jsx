import React, { useState, useEffect, useRef } from 'react';

export default function AccountManagement() {
  // 1. DỮ LIỆU KHỞI TẠO MẪU (Đã bổ sung thuộc tính lastActive - YYYY-MM-DD)
  const [accounts, setAccounts] = useState([
    { id: 1, email: "admin@pvi.com.vn", password: "••••••••", role: "HỆ THỐNG ADMIN", status: "Active", lastActive: "2026-06-15", description: "Tài khoản quản trị viên tối cao hệ thống" },
    { id: 2, email: "partner.momo@pvi.com.vn", password: "••••••••", role: "ĐỐI TÁC", status: "Active", lastActive: "2026-01-10", description: "Kênh kết nối dữ liệu ví điện tử MoMo" },
    { id: 3, email: "partner.vifo@pvi.com.vn", password: "••••••••", role: "ĐỐI TÁC", status: "Active", lastActive: "2024-05-20", description: "Cổng tích hợp hệ thống bảo hiểm VIFO" }, // Quá 1 năm (Sẽ bị tự động khóa)
    { id: 4, email: "support.hcm@pvi.com.vn", password: "••••••••", role: "CHUYÊN VIÊN", status: "Inactive", lastActive: "2025-11-12", description: "Hỗ trợ kỹ thuật khu vực miền Nam" }
  ]);

  // 2. CÁC TRẠNG THÁI QUẢN LÝ UI/MODAL
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  
  // Trạng thái Form nhập liệu
  const [currentAccount, setCurrentAccount] = useState({ id: null, email: '', password: '', role: 'ĐỐI TÁC', status: 'Active', lastActive: '', description: '' });
  
  const dropdownRef = useRef(null);

  // TỰ ĐỘNG QUÉT KHÓA TÀI KHOẢN ĐỐI TÁC KHÔNG HOẠT ĐỘNG > 1 NĂM (365 ngày)
  useEffect(() => {
    const today = new Date();
    
    const updatedAccounts = accounts.map(acc => {
      if (acc.role === 'ĐỐI TÁC' && acc.lastActive) {
        const lastActiveDate = new Date(acc.lastActive);
        const timeDiff = today.getTime() - lastActiveDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // Nếu không hoạt động quá 365 ngày và tài khoản chưa bị khóa
        if (daysDiff > 365 && acc.status === 'Active') {
          return {
            ...acc,
            status: 'Inactive',
            description: `⚠️ [TỰ ĐỘNG KHÓA]: Tài khoản quá hạn 1 năm không hoạt động (Lần cuối: ${acc.lastActive}). Liên hệ phòng kỹ thuật PVI để kích hoạt.`
          };
        }
      }
      return acc;
    });

    // Chỉ cập nhật state nếu có sự thay đổi dữ liệu thật sự nhằm tránh lặp vô hạn (Infinite Loop)
    if (JSON.stringify(updatedAccounts) !== JSON.stringify(accounts)) {
      setAccounts(updatedAccounts);
    }
  }, [accounts]);

  // Tự động đóng dropdown user profile khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. XỬ LÝ HÀM NGHIỆP VỤ (THÊM, SỬA, XÓA, ĐĂNG XUẤT)
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert("🔒 Đã đăng xuất tài khoản quản trị!");
    window.location.reload();
  };

  const openAddModal = () => {
    setModalMode('add');
    setShowPasswordInModal(false);
    // Khi thêm mới mặc định lấy ngày hôm nay làm lastActive
    const todayStr = new Date().toISOString().split('T')[0];
    setCurrentAccount({ id: null, email: '', password: '', role: 'ĐỐI TÁC', status: 'Active', lastActive: todayStr, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    setModalMode('edit');
    setShowPasswordInModal(false);
    setCurrentAccount({ ...account });
    setIsModalOpen(true);
  };

  const handleDelete = (id, email) => {
    if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa tài khoản "${email}" khỏi hệ thống PVI Portal không?`)) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentAccount.email.trim()) {
      alert("Vui lòng nhập Email tài khoản!");
      return;
    }
    if (!currentAccount.password.trim()) {
      alert("Vui lòng nhập Mật khẩu tài khoản!");
      return;
    }

    // KIỂM TRA LOGIC KÍCH HOẠT LẠI TÀI KHOẢN ĐỐI TÁC QUÁ HẠN 1 NĂM
    if (modalMode === 'edit') {
      const originalAccount = accounts.find(acc => acc.id === currentAccount.id);
      
      // Nếu trạng thái cũ là bị Khóa (Inactive) và người dùng cố tình chuyển sang Hoạt động (Active)
      if (originalAccount && originalAccount.status === 'Inactive' && currentAccount.status === 'Active') {
        const lastActiveDate = new Date(originalAccount.lastActive);
        const today = new Date();
        const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 3600 * 24));

        if (originalAccount.role === 'ĐỐI TÁC' && daysDiff > 365) {
          // Bật thông báo yêu cầu liên hệ bộ phận quản lý công ty theo yêu cầu của bạn
          alert("🚫 Không thể kích hoạt trực tiếp!\n\nTài khoản đối tác này đã ngừng hoạt động hơn 1 năm. Vui lòng liên hệ trực tiếp với Bộ phận Chăm sóc đối tác / Phòng CNTT Tổng công ty Bảo hiểm PVI để phê duyệt và gia hạn thủ tục mở khóa.");
          return; // Chặn hành động lưu dữ liệu trái phép
        }
      }
    }

    if (modalMode === 'add') {
      const newAcc = {
        ...currentAccount,
        id: Date.now()
      };
      setAccounts([...accounts, newAcc]);
    } else {
      setAccounts(accounts.map(acc => acc.id === currentAccount.id ? currentAccount : acc));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 text-sm overflow-hidden font-sans select-text">
      
      {/* CỘT SIDEBAR BÊN TRÁI */}
      <div className="w-64 shrink-0 bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 select-none">
        <div>
          <div className="p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">Hệ thống chức năng</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20 cursor-pointer transition-all">
                <span>👥</span>
                <span>Quản lý tài khoản</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center bg-[#0b0f19]">
          PVI Portal © 2026 Admin Panel
        </div>
      </div>

      {/* KHU VỰC CHÍNH BÊN PHẢI */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 p-6 overflow-y-auto max-w-full">
          <div className="max-w-6xl mx-auto space-y-5">
            
            {/* Header Tiêu đề trang */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 text-left">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản Lý Tài Khoản Hệ Thống</h1>
                <p className="text-xs text-slate-500 mt-1">Hệ thống tự động khóa tài khoản đối tác không tương tác trên 1 năm. Yêu cầu liên hệ nội bộ khi cần khôi phục kích hoạt.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5 cursor-pointer border-0 outline-none"
              >
                <span className="text-sm font-light">+</span> Thêm Tài Khoản Mới
              </button>
            </div>

            {/* BẢNG HIỂN THỊ DANH SÁCH TÀI KHOẢN */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 select-none">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600 w-12 text-center">STT</th>
                      <th className="p-4 font-semibold text-slate-600">Tài khoản (Email)</th>
                      <th className="p-4 font-semibold text-slate-600 w-32">Quyền hạn</th>
                      <th className="p-4 font-semibold text-slate-600 w-28 text-center">Trạng thái</th>
                      <th className="p-4 font-semibold text-slate-600 w-32 text-center">HĐ cuối cùng</th>
                      <th className="p-4 font-semibold text-slate-600">Ghi chú nghiệp vụ</th>
                      <th className="p-4 font-semibold text-slate-600 w-36 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {accounts.map((acc, index) => {
                      // Tính số ngày không hoạt động để hiện cảnh báo trực quan
                      const days = acc.lastActive ? Math.floor((new Date() - new Date(acc.lastActive)) / (1000 * 3600 * 24)) : 0;
                      const isOverdue = acc.role === 'ĐỐI TÁC' && days > 365;

                      return (
                        <tr key={acc.id} className={`hover:bg-slate-50/50 transition-colors ${isOverdue ? 'bg-amber-50/20' : ''}`}>
                          <td className="p-4 text-slate-400 text-center font-mono">{index + 1}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{acc.email}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">UID: PVI-{acc.id}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide border ${
                              acc.role === 'HỆ THỐNG ADMIN' ? 'bg-red-50 text-red-600 border-red-200' :
                              acc.role === 'ĐỐI TÁC' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {acc.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              acc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {acc.status}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-slate-600">
                            {acc.lastActive || '---'}
                            {isOverdue && <div className="text-[9px] text-rose-500 font-bold font-sans mt-0.5">(Quá hạn 1 năm)</div>}
                          </td>
                          <td className="p-4 text-slate-500 max-w-xs truncate">{acc.description || '---'}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => openEditModal(acc)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-bold cursor-pointer outline-none"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDelete(acc.id, acc.email)}
                                className="px-2.5 py-1 rounded-lg border border-rose-100 bg-rose-50/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors font-bold cursor-pointer outline-none"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DIALOG ĐIỀU KHIỂN THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden font-sans">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-left">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                  {modalMode === 'add' ? '✨ Cấp tài khoản portal mới' : '📝 Cập nhật thông tin tài khoản'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Vui lòng hoàn thiện đúng cấu trúc nghiệp vụ định danh PVI.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm border-0 bg-transparent cursor-pointer outline-none">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4 text-left">
              
              {/* Cảnh báo nếu tài khoản đối tác đang thuộc diện quá hạn */}
              {modalMode === 'edit' && currentAccount.role === 'ĐỐI TÁC' && (Math.floor((new Date() - new Date(currentAccount.lastActive)) / (1000 * 3600 * 24)) > 365) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs leading-normal font-medium">
                  🔒 <b>Tài khoản bị khóa tự động do quá 1 năm không dùng.</b> Quản trị viên không thể tự ý kích hoạt lại ở giao diện này. Vui lòng hướng dẫn đối tác liên hệ bộ phận quản lý cấp cao để làm tờ trình mở khóa.
                </div>
              )}

              {/* Trường nhập Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Địa chỉ Email <span className="text-rose-500">*</span></label>
                <input 
                  type="email" required placeholder="example@pvi.com.vn"
                  value={currentAccount.email}
                  onChange={(e) => setCurrentAccount({...currentAccount, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner font-medium text-slate-800"
                />
              </div>

              {/* Trường nhập Mật khẩu */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Mật khẩu tài khoản <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input 
                    type={showPasswordInModal ? "text" : "password"} required placeholder="Nhập mật khẩu bảo mật..."
                    value={currentAccount.password || ''}
                    onChange={(e) => setCurrentAccount({...currentAccount, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner font-mono font-medium text-slate-800"
                  />
                  <button type="button" onClick={() => setShowPasswordInModal(!showPasswordInModal)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-xs outline-none font-bold">
                    {showPasswordInModal ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              {/* Trường Ngày hoạt động cuối cùng */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Ngày hoạt động cuối cùng</label>
                <input 
                  type="date"
                  value={currentAccount.lastActive || ''}
                  onChange={(e) => setCurrentAccount({...currentAccount, lastActive: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner font-medium text-slate-800"
                />
              </div>

              {/* Trường chọn Quyền hạn */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Quyền hạn hệ thống</label>
                <select 
                  value={currentAccount.role}
                  onChange={(e) => setCurrentAccount({...currentAccount, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-medium cursor-pointer text-slate-800"
                >
                  <option value="ĐỐI TÁC">ĐỐI TÁC (Partner Gateway)</option>
                  <option value="CHUYÊN VIÊN">CHUYÊN VIÊN (Underwriter)</option>
                  <option value="HỆ THỐNG ADMIN">HỆ THỐNG ADMIN (Full Access)</option>
                </select>
              </div>

              {/* Trường chọn Trạng thái */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Trạng thái tài khoản</label>
                <div className="flex items-center space-x-4 pt-1 font-medium text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input 
                      type="radio" name="status" value="Active" 
                      checked={currentAccount.status === 'Active'}
                      onChange={() => setCurrentAccount({...currentAccount, status: 'Active'})}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    /> Kích hoạt (Active)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input 
                      type="radio" name="status" value="Inactive" 
                      checked={currentAccount.status === 'Inactive'}
                      onChange={() => setCurrentAccount({...currentAccount, status: 'Inactive'})}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    /> Tạm khóa (Inactive)
                  </label>
                </div>
              </div>

              {/* Trường Mô tả/Ghi chú */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase block">Mô tả thông tin</label>
                <textarea 
                  rows="3" placeholder="Nhập ghi chú mục đích sử dụng tài khoản này..."
                  value={currentAccount.description}
                  onChange={(e) => setCurrentAccount({...currentAccount, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner resize-none font-medium leading-normal text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer border-0 outline-none">
                  Hủy bỏ
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all shadow cursor-pointer border-0 outline-none">
                  Lưu Thông Tin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}