import React from 'react';
import { ShieldCheck, AlertTriangle, Link as LinkIcon, Smartphone, Check } from 'lucide-react';

export const AffiliateGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Hướng Dẫn Gắn Link An Toàn 🛡️</h2>
        <p className="text-gray-600">Tránh bị TikTok "gậy" hoặc bóp tương tác vì gắn link sai cách.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Danger Zone */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
          <h3 className="flex items-center gap-2 text-xl font-bold text-red-700 mb-4">
            <AlertTriangle className="w-6 h-6" /> Những Điều CẤM KỴ
          </h3>
          <ul className="space-y-3">
            {[
              "Không dán link trực tiếp vào caption video.",
              "Không nhắc đến 'Link ở comment' (TikTok quét âm thanh/text).",
              "Không dùng link rút gọn lạ (bit.ly) dễ bị chặn.",
              "Không spam logo Shopee quá to trong video."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-red-800">
                <span className="font-bold text-lg leading-none">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Safe Zone */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="flex items-center gap-2 text-xl font-bold text-green-700 mb-4">
            <ShieldCheck className="w-6 h-6" /> Cách Làm ĐÚNG
          </h3>
          <ul className="space-y-3">
            {[
              "Sử dụng Link Bio (Bio Link) ở trang cá nhân.",
              "Điều hướng khéo: 'Xem ở đầu trang nhé'.",
              "Sử dụng tính năng 'Gắn sản phẩm' (Giỏ hàng) chính chủ TikTok Shop nếu có.",
              "Dùng Landing Page trung gian (Liolux, Carrd, BioLink)."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-green-800">
                <Check className="w-5 h-5 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step by Step Bio Link */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-600" /> Quy trình tạo Bio Link chuẩn SEO
        </h3>
        
        <div className="relative border-l-2 border-blue-200 ml-3 space-y-8 pl-8 py-2">
          <div className="relative">
            <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold ring-4 ring-white">1</span>
            <h4 className="font-bold text-gray-800">Tạo trang Landing Page</h4>
            <p className="text-gray-600 text-sm mt-1">Dùng các công cụ miễn phí như Canva, Carrd, hoặc Beacons. Thiết kế đơn giản, mobile-first.</p>
          </div>
          
          <div className="relative">
            <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold ring-4 ring-white">2</span>
            <h4 className="font-bold text-gray-800">Lấy link tiếp thị Shopee</h4>
            <p className="text-gray-600 text-sm mt-1">Vào Shopee Affiliate Portal {'>'} Lấy Link Sản Phẩm {'>'} Rút gọn link (bắt buộc dùng link của Shopee cấp).</p>
          </div>

          <div className="relative">
            <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold ring-4 ring-white">3</span>
            <h4 className="font-bold text-gray-800">Gắn vào Bio TikTok</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yêu cầu: Tài khoản cần trên 1,000 Follower (đối với cá nhân) HOẶC chuyển sang Tài khoản Doanh nghiệp (Business Account) để mở khóa tính năng Website ngay lập tức.
            </p>
          </div>

           <div className="relative">
            <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold ring-4 ring-white">4</span>
            <h4 className="font-bold text-gray-800">Video dẫn dắt</h4>
            <p className="text-gray-600 text-sm mt-1">
              Trong video, hãy chỉ tay lên góc trái (nếu gắn giỏ hàng) hoặc nhắc người xem bấm vào ảnh đại diện để xem thêm thông tin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};